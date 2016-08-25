// function to extract query string
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// Update question text
var questionString = getParameterByName("question");
var type = getParameterByName("type");
console.log(type);
document.getElementById("question").innerHTML = questionString;
document.getElementById("hidden question").value = questionString;
document.getElementById("hidden type").value = type;

// Update response type 
var questionType = getParameterByName("type");
var responseField = document.getElementById("response-field");
var newHTML = "";

switch (questionType) {
  case "yes-no" :
    console.log("in y/n case");
    newHTML += '<input type="radio" name="answer" value="yes"> Yes\n';
    newHTML += '<input type="radio" name="answer" value="no"> No\n';
    break;
  case "free-response" :
    newHTML += '<input type = "text" name="answer">';
  break;
  case "slider" :
  newHTML +=  '<table id="slider_table" class="slider_table">\n' ;
  newHTML += '<tr>';
  newHTML += '<td class="left"><h3>not at all</h3></td>';
  newHTML += '<td class="right" id="numObjects"><h3>very</h3></td>';
  newHTML += '</tr>';
  newHTML += '';
  newHTML += '<tr><td colspan="2"><div id="single_slider" class="slider"></div></td></tr>';
  newHTML += '</table>';
  newHTML += '<input type="hidden" name="response" id="hidden_slider" value=".5">'; 

  break;
  case "likert" :
    newHTML += '<table align = "center"><tr>\n';
    newHTML += '<td align="center"> ';
    newHTML += '<tr> ';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td>Not at all</td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td>Somewhat</td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td>Very</td>';
    newHTML += '	    </tr>';
    newHTML += '	    <tr>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td><input id ="likert1" type="radio" name="judgment" value = "1">';
    newHTML += '		<label for="likert1"></label></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td><input id ="likert2" type="radio" name="judgment" value = "2">';
    newHTML += '		<label for="likert2"></label></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td><input id ="likert3" type="radio" name="judgment" value = "3">';
    newHTML += '		<label for="likert3"></label></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td><input id ="likert4" type="radio" name="judgment" value = "4">';
    newHTML += '		<label for="likert4"></label></td>';
    newHTML += '	      <td></td>';
    newHTML += '	      <td><input id ="likert5" type="radio" name="judgment" value = "5">';
    newHTML += '		<label for="likert5"></label></td>';
    newHTML += '	      <td>&nbsp;&nbsp;&nbsp;</td>';
    newHTML += '	      <td></td>';
    newHTML += '	    </tr>';
    newHTML += '	          </table>';
    break;
}

function make_slider(label, response_callback) {
  //$(label).empty();
  $(label).slider({
    range : "min",
    min : 0,
    max : 1,
    step: 0.01,
    value : 0.5,
    slide : response_callback,
    change : response_callback
  });
  $(label + ' .ui-slider-handle').hide();
  $(label).mousedown(function(){
    $(label + ' .ui-slider-handle').show();
    $(label).css({"background":"#99D6EB"});
    $(label + ' .ui-slider-handle').css({
      "background":"#667D94",
      "border-color": "#001F29"
    });
  });
  $(label).css({"background":"#eee"});
};

responseField.innerHTML = newHTML;

// Need to do this after innerHTML is set
if(questionType == "slider") {
  make_slider("#single_slider", function(event, ui) {
    $('#hidden_slider')[0].value = ui.value ;
  });
}
