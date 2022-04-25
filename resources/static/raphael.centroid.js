Raphael.el.getCentroid = function() {
    var centroid      = { x: 0, y: 0, area: 0 }
      , area          = 0
      , length        = this.getTotalLength()
      , lengthSegment = length / 100.00;
    
    for (var i = 0; i < length; i += lengthSegment) {
        var curr = this.getPointAtLength(i)
          , next = this.getPointAtLength(i + lengthSegment);
        
        centroid.x += (curr.x + next.x) * (curr.x*next.y - next.x*curr.y);
        centroid.y += (curr.y + next.y) * (curr.x*next.y - next.x*curr.y);
        
        area += (curr.x*next.y - next.x*curr.y);
    }
    
    area = area / 2.0;
    
    centroid.area = area;
    centroid.x = centroid.x / (6 * area);
    centroid.y = centroid.y / (6 * area);
    
    return centroid;
};