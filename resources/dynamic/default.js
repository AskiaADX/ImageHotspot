{%
Dim option = On(CurrentQuestion.AvailableResponses.Count = 1 And CurrentADC.PropValue("likeOpt") = "0", -1, CurrentQuestion.AvailableResponses.Count)
%}
var imageHotspot = new ImageHotspot({adcContainer:"adc-container{%= CurrentADC.InstanceId %}", 
	adcID:"adc_{%= CurrentADC.InstanceId %}", 
	areas:[

	{%
		Dim j
		Dim coords = ""
		Dim propname = ""
		Dim areaname = ""
		For j = 1 To CurrentQuestion.AllIterations.Count
    		'For i = 1 To CurrentQuestion.Iteration(j).AvailableResponses.Count 
		   	propname = "hotspot"+j
    		areaname = "P"+(j-1)
    		coords = CurrentADC.PropValue(propname)
    %}
		{
        	paath: "{%= coords %}",
        	name: "{%= areaname %}"
		{%:= On(j = CurrentQuestion.AllIterations.Count,"}","},") %}
	{%                                      
		Next
	%}
	], 
    option: {%= option %}, 
    values:[{%= CurrentQuestion.Iteration(1).AvailableResponses[1].InputValue()%}, {%= CurrentQuestion.Iteration(1).AvailableResponses[2].InputValue()%}, {%= CurrentQuestion.Iteration(1).AvailableResponses[3].InputValue()%}], 
	imageWidth:'{%= CurrentADC.PropValue("imageWidth")%}', 
	imageHeight:'{%= CurrentADC.PropValue("imageHeight")%}',
    hoverColor:'rgb({%= CurrentADC.PropValue("hoverColor").ToRGB() %})',
    likeColor:'rgb({%= CurrentADC.PropValue("likeColor").ToRGB() %})',
    neutralColor:'rgb({%= CurrentADC.PropValue("neutralColor").ToRGB() %})',
    dislikeColor:'rgb({%= CurrentADC.PropValue("dislikeColor").ToRGB() %})',
    numResponses:{%= CurrentQuestion.Iteration(1).AvailableResponses.Count %},
    likeOpt:{%= CurrentADC.PropValue("likeOpt") %},
    currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
    showAreas: '{%= CurrentADC.PropValue("showAreas")%}',
    areasColor: '{%= CurrentADC.PropValue("areasColor").ToHexa() %}'
});