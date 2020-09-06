var mainText = document.getElementById("mainText");
var submitBtn = document.getElementById("uploadBtn");
var loader = document.getElementById("loader");
var questionsId = document.getElementById("questionsId")
var errorMessage = document.getElementById("errorMessage");
const realFileBtn = document.getElementById("real-file");
const customBtn = document.getElementById("chooseBtn");
const customTxt = document.getElementById("custom-text");
let dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function submitClick(){
  showLoading();
  var firebaseRef = firebase.database().ref(questionsId.value);
  
  firebaseRef.once('value',function(datasnapshot){
    if(datasnapshot.exists()){
      console.log("Error");
      errorMessage.style.display = "inline";
      errorMessage.style.color = "red";
      showError("Error: File with this id allready exists");
      questionsId.value = "";
      return;
      
    }else{
      var parent  = firebaseRef;
    
      for (j = 0; j < questions.length; j++) {
        var nFields = questions[j].length;
        parent.child(j+1).child("inquiry").set(questions[j][0]);
        for (k = 0; k < nFields-2; k++){
          
          parent.child(j+1).child("option" + k).set(questions[j][k+1]);
          if(k==4){
            showError( "Error: There is one or more questions witch contain more than 4 posible answers");
            parent.remove();
            return;
            
          }
        }
        parent.child(j+1).child("answer").set(questions[j][nFields-1]);
      }
      if(j<11){
        showError( "Error: File contains less than 12 questions");
        parent.remove();
        return;
      }
      errorMessage.style.display = "inline";
      errorMessage.style.color = "green";
      errorMessage.innerHTML = "Uploaded!";

    }

  });
  
  hideLoading();
}
function showError(message){
  errorMessage.style.display = "inline";
  errorMessage.style.color = "red";
  errorMessage.innerHTML = message;
}
customBtn.addEventListener("click", function() {
  realFileBtn.click();
});
realFileBtn.addEventListener("change", function() {
  if (realFileBtn.value) {
    handleFile(realFileBtn.files[0]);
  } else {
    customTxt.innerHTML = "No file chosen, yet.";
  }
});

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
} 

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  const dt = e.dataTransfer;
  const files = dt.files;
  handleFile(files[0]);
}
function showLoading(){
  loader.style.display = "block";
}
function hideLoading(){
  loader.style.display = "none";
}
function hideElements(){
  hideLoading();
  setBtnInactive();
  errorMessage.style.display = "none";
}
function setBtnInactive(){
  submitBtn.style.backgroundColor = "#adadad";
  submitBtn.disabled = true;
}
function setBtnActive(){
  submitBtn.style.backgroundColor = "#0b9612";
  submitBtn.disabled = false;
}
var questions = [];
function handleFile(f){
  
  customTxt.innerHTML =f.name;
  //window.alert("Added "+ f.name);
  const reader = new FileReader();
  
  reader.onload = function(){
    
    const lines = reader.result.split('\n');
    var answerString = "ANSWER: ";
    var i = 0;
    var question = [];
    question[0] = "";
    var questionIndex = 1;
    while(i<lines.length){

      var line = lines[i];

      if(line.search(/[a-z]/i) == -1){
        // New question
        
        var question = [];
        question[0] = "";
        var questionIndex = 1;
      }else{
        if(line[1]=="." ||  line[1]==")"){
          // Line is an option
          
          question[questionIndex] = sanitazeString(line);
          questionIndex++;
        }else{
          if(line.slice(0,8)==answerString){
            // Line is answer
            question[questionIndex] = line[8];
            questions.push(question);
          }else{
            // Line is inquiry text
            question[0] = question[0] + sanitazeString(line);
          }
        }
      }
      i++;
    }
    setBtnActive();
  };
  reader.readAsText(f);
}
function sanitazeString(str){
  var newstr = ""; 
  for( var i = 0; i < str.length; i++ )  
    if( !(str[i] == '\n' || str[i] == '\r') ) 
        newstr += str[i]; 
  return newstr;
}