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
    values:[1, 2, 3], 
	imageWidth:{%= CurrentADC.PropValue("imageWidth")%}, 
	imageHeight:{%= CurrentADC.PropValue("imageHeight")%}
});