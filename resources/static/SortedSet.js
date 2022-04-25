// Copyright (c) 2016, Jerry.Wang
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN if (ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


const SKIPLIST_MAXLEVEL = 32 /* Should be enough for 2^32 elements */

function SortedSetLevel(forward, span) {
	this.forward = forward
	this.span = span
}

// Node in skip list
function SortedSetNode(key, value, score, backward, level) {
	this.key      = key     
	this.value    = value   
	this.score    = score   
	this.backward = backward
	this.level    = level   
}

function SortedSet(length, level, dict) {
	this.header = this.createNode(SKIPLIST_MAXLEVEL, 0, "", undefined)
	this.tail   = undefined
	this.length = 0
	this.level  = 1
	this.dict   = {}
}

SortedSet.prototype.createNode = function(level, score, key, value) {
	var levelarr = [];
	while (level--) {
		levelarr.push(new SortedSetLevel);
	}
	return new SortedSetNode(key, value, score, undefined, levelarr);
}

SortedSet.prototype.insertNode = function(score, key, value) {
	function randomLevel() {
		const SKIPLIST_P = 0.25      /* Skiplist P = 1/4 */
		var level = 1
		while ((Math.random()*0xFFFF) < (SKIPLIST_P*0xFFFF)) {
			level += 1
		}
		if (level < SKIPLIST_MAXLEVEL) {
			return level
		}

		return SKIPLIST_MAXLEVEL
	}

	var update = new Array(SKIPLIST_MAXLEVEL)
	var rank = new Array(SKIPLIST_MAXLEVEL)

	var x = this.header
	for (var i = this.level - 1; i >= 0; i--) {
		/* store rank that is crossed to reach the insert position */
		if (this.level-1 == i) {
			rank[i] = 0
		} else {
			rank[i] = rank[i+1]
		}

		while (x.level[i].forward != undefined &&
			(x.level[i].forward.score < score ||
				(x.level[i].forward.score == score && // score is the same but the key is different
					x.level[i].forward.key < key))) {
			rank[i] += x.level[i].span
			x = x.level[i].forward
		}
		update[i] = x
	}

	/* we assume the key is not already inside, since we allow duplicated
	 * scores, and the re-insertion of score and redis object should never
	 * happen since the caller of Insert() should test in the hash table
	 * if (the element is already inside or not. */
	var level = randomLevel()

	if (level > this.level) { // add a new level
		for (i = this.level; i < level; i++) {
			rank[i] = 0
			update[i] = this.header
			update[i].level[i].span = this.length
		}
		this.level = level
	}

	x = this.createNode(level, score, key, value)
	for (i = 0; i < level; i++) {
		x.level[i].forward = update[i].level[i].forward
		update[i].level[i].forward = x

		/* update span covered by update[i] as x is inserted here */
		x.level[i].span = update[i].level[i].span - (rank[0] - rank[i])
		update[i].level[i].span = (rank[0] - rank[i]) + 1
	}

	/* increment span for untouched levels */
	for (i = level; i < this.level; i++) {
		update[i].level[i].span++
	}

	if (update[0] == this.header) {
		x.backward = undefined
	} else {
		x.backward = update[0]
	}
	if (x.level[0].forward != undefined) {
		x.level[0].forward.backward = x
	} else {
		this.tail = x
	}
	this.length++
	return x
}

/* Internal function used by delete, DeleteByScore and DeleteByRank */
SortedSet.prototype.deleteNode = function(x, update) {
	for (var i = 0; i < this.level; i++) {
		if (update[i].level[i].forward == x) {
			update[i].level[i].span += x.level[i].span - 1
			update[i].level[i].forward = x.level[i].forward
		} else {
			update[i].level[i].span -= 1
		}
	}
	if (x.level[0].forward != undefined) {
		x.level[0].forward.backward = x.backward
	} else {
		this.tail = x.backward
	}
	while (this.level > 1 && this.header.level[this.level-1].forward == undefined) {
		this.level--
	}
	this.length--
	delete this.dict[x.key]
}

/* Delete an element with matching score/key from the skiplist. */
SortedSet.prototype.delete = function(score, key) {
	var update = new Array(SKIPLIST_MAXLEVEL)

	var x = this.header
	for (i = this.level - 1; i >= 0; i--) {
		while (x.level[i].forward != undefined &&
			(x.level[i].forward.score < score ||
				(x.level[i].forward.score == score &&
					x.level[i].forward.key < key))) {
			x = x.level[i].forward
		}
		update[i] = x
	}
	/* We may have multiple elements with the same score, what we need
	 * is to find the element with both the right score and object. */
	x = x.level[0].forward
	if (x != undefined && score == x.score && x.key == key) {
		this.deleteNode(x, update)
		// free x
		return true
	}
	return false /* not found */
}

// Add an element into the sorted set with specific key / value / score.
// if (the element is added, this method returns true; otherwise false means updated
//
// Time complexity of this method is : O(log(N))
SortedSet.prototype.AddOrUpdate =  function(key, score, value) {
	var newNode = undefined

	var found = this.dict[key]
	if (found != undefined) {
		// score does not change, only update value
		if (found.score == score) {
			found.value = value
		} else { // score changes, delete and re-insert
			this.delete(found.score, found.key)
			newNode = this.insertNode(score, key, value)
		}
	} else {
		newNode = this.insertNode(score, key, value)
	}

	if (newNode != undefined) {
		this.dict[key] = newNode
	}
	return found == undefined
}

// Delete element specified by key
//
// Time complexity of this method is : O(log(N))
SortedSet.prototype.Remove = function(key) {
	var found = this.dict[key]
	if (found != undefined) {
		this.delete(found.score, found.key)
		return found
	}
	return undefined
}

// sanitizeIndexes return start, end, and reverse flag
SortedSet.prototype.sanitizeIndexes = function(start, end) {
	if (start < 0) {
		start = this.length + start + 1
	}
	if (end < 0) {
		end = this.length + end + 1
	}
	if (start <= 0) {
		start = 1
	}
	if (end <= 0) {
		end = 1
	}

	var reverse = start > end
	if (reverse) { // swap start and end
		return [end, start, reverse]
	}
	return [start, end, reverse]
}

SortedSet.prototype.findNodeByRank = function(start, remove) {
	var traversed = 0
	var x = this.header
	var update = new Array(SKIPLIST_MAXLEVEL)
	for (var i = this.level - 1; i >= 0; i--) {
		while (x.level[i].forward != undefined &&
			(traversed+x.level[i].span) < start) {
			traversed += x.level[i].span
			x = x.level[i].forward
		}
		if (remove) {
			update[i] = x
		} else {
			if (traversed+1 == start) {
				break
			}
		}
	}
	return [traversed, x, update]
}

// Get nodes within specific rank range [start, end]
// Note that the rank is 1-based integer. Rank 1 means the first node; Rank -1 means the last node;
//
// if (start is greater than end, the returned array is in reserved order
// if (remove is true, the returned nodes are removed
//
// Time complexity of this method is : O(log(N))
SortedSet.prototype.GetByRankRange = function(start, end, remove) {
	var index = this.sanitizeIndexes(start, end)
	var start = index[0], end = index[1], reverse = index[2]

	var nodes = []

	var fnbr = this.findNodeByRank(start, remove)
	var traversed = fnbr[0], x = fnbr[1], update = fnbr[2]

	traversed++
	x = x.level[0].forward
	while (x != undefined && traversed <= end) {
		next = x.level[0].forward

		nodes.push(x)

		if (remove) {
			this.deleteNode(x, update)
		}

		traversed++
		x = next
	}

	if (reverse) {
		for (var i = 0, j = nodes.length-1; i < j; i++, j--) {
			nodes[i] = [nodes[j],nodes[j]=nodes[i]][0]
		}
	}
	return nodes
}

// Get node by rank.
// Note that the rank is 1-based integer. Rank 1 means the first node; Rank -1 means the last node;
//
// if (remove is true, the returned nodes are removed
// if (node is not found at specific rank, undefined is returned
//
// Time complexity of this method is : O(log(N))
SortedSet.prototype.GetByRank = function(rank, remove) {
	var nodes = this.GetByRankRange(rank, rank, remove)
	if (nodes.length == 1) {
		return nodes[0]
	}
	return undefined
}

// Get node by key
//
// if (node is not found, undefined is returned
// Time complexity : O(1)
SortedSet.prototype.GetByKey = function(key) {
	return this.dict[key]
}

// Find the rank of the node specified by key
// Note that the rank is 1-based integer. Rank 1 means the first node
//
// if (the node is not found, 0 is returned. Otherwise rank(> 0) is returned
//
// Time complexity of this method is : O(log(N))
SortedSet.prototype.FindRank = function(key) {
	var rank = 0
	var node = this.dict[key]
	if (node != undefined) {
		var x = this.header
		for (var i = this.level - 1; i >= 0; i--) {
			while (x.level[i].forward != undefined &&
				(x.level[i].forward.score < node.score ||
					(x.level[i].forward.score == node.score &&
						x.level[i].forward.key <= node.key))) {
				rank += x.level[i].span
				x = x.level[i].forward
			}

			if (x.key == key) {
				return rank
			}
		}
	}
	return 0
}