var imageHotspot = new ImageHotspot({adcContainer:"adc-container{%= CurrentADC.InstanceId %}", 
	adcID:"adc_{%= CurrentADC.InstanceId %}", 
	areas:[{%
		Dim j
		Dim coords = ""
		Dim propname = ""
		Dim areaname = ""
		Dim values
		Dim questionmode = CurrentADC.PropValue("mode")
		Dim useArray = CurrentADC.PropValue("useHotspotArray").ToNumber()
		Dim hotspots = CurrentADC.PropValue("hotspotArray").Split("|")
		For j = 1 To CurrentQuestion.ParentLoop.AvailableAnswers.Count
    		propname = "hotspot"+j
    		areaname = "P"+(j - 1)
    		coords = On(useArray, hotspots[j], CurrentADC.PropValue(propname))
    %}
		{ name: "{%= areaname %}", path: "{%= coords %}"{%:= On(j = CurrentQuestion.ParentLoop.AvailableAnswers.Count,"}","},") %}{% Next	%}
	], 
    values:[ 
		{% If CurrentQuestion.Type = "single" Then 
		For j = 1 To CurrentQuestion.AvailableResponses.Count %}'{%:= CurrentQuestion.AvailableResponses[j].InputValue()%}'{%:= On(j = CurrentQuestion.AvailableResponses.Count,"",", ") %}{% Next %}
		{% Else
            If questionmode =  "1" Then
            	values = "'1'"
            ElseIf questionmode =  "2" Then
            	values = "'" + Range(1, CurrentQuestion.ParentLoop.AvailableAnswers.Count).ToString().Replace(";","', '") + "'"
            ElseIf questionmode =  "3" Then
            	values = "'1', '-1'"
            ElseIf questionmode =  "4" Then
            	values = "'1', '0', '-1'"
            EndIf %}
		{%= values %}{% EndIf %}
	], 
    imageWidth: '{%= CurrentADC.PropValue("imageWidth")%}', 
    imageHeight: '{%= CurrentADC.PropValue("imageHeight")%}',
    hoverColor: 'rgb({%= CurrentADC.PropValue("hoverColor").ToRGB() %})',
    likeColor: 'rgb({%= CurrentADC.PropValue("likeColor").ToRGB() %})',
    neutralColor: 'rgb({%= CurrentADC.PropValue("neutralColor").ToRGB() %})',
    dislikeColor: 'rgb({%= CurrentADC.PropValue("dislikeColor").ToRGB() %})',
    mode: {%= CurrentADC.PropValue("mode") %},
    currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
    showAreas: {%= CurrentADC.PropValue("showAreas") %},
    areasColor: '{%= CurrentADC.PropValue("areasColor").ToHexa() %}',
    areasOpacity: {%= CurrentADC.PropValue("areasOpacity") %}
});