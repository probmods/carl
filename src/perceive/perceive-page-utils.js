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

responseField.innerHTML = newHTML;
