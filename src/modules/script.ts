import * as UserCreator from "./UserCreator"
import * as postCreator from "./postCreator"
import axios from "../../node_modules/axios/lib/axios"
// #region buttons
const logInBtn = document.getElementById('logInBtn')
const createFormBtn = document.getElementById('createAcc')
const createFormBtn2 = document.getElementById('createAcc2')
const logInForm = document.getElementById('logInForm')
const loginCreate = document.getElementById('loginCreate')
const createSubmit = document.getElementById('createSubmit')
const loginTryBtn = document.getElementById('loginTryBtn')
const createNewPostBtn = document.getElementById('createNewPost')
const createPostForm  = document.getElementById('createPostForm')
const createPostSubmit = document.getElementById('createPostBtn')
const welcomeText = document.getElementById('welcomeText')
const profileShow = document.getElementById('profileShow')
const profileh1 = <HTMLTextAreaElement> document.getElementById('profileh1')
const postContainer = document.getElementById('postContainer')
const contentHolder = document.getElementById('contentHolder')
const logOutBtn = document.getElementById('logOutBtn')
const loggedinAs = <HTMLTextAreaElement> document.getElementById('loggedInas')
createNewPostBtn?.addEventListener('click', ()=>{createPostForm?.classList.toggle('inactive')})
logInBtn?.addEventListener('click', () =>{logInForm?.classList.toggle('inactive'); loginCreate?.classList.add('inactive')})
createFormBtn?.addEventListener('click', () =>{loginCreate?.classList.toggle('inactive'); logInForm?.classList.add('inactive')})
createFormBtn2?.addEventListener('click', () =>{loginCreate?.classList.remove('inactive'); logInForm?.classList.add('inactive')})
logOutBtn?.addEventListener('click', () => {document.cookie = "username=" + getCookie() + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;", location.reload()})
let currentFeed: string = `${getCookie()}`
// #endregion
// #region inputStuff
const usernameLogin = <HTMLInputElement>document.getElementById('usernameLogin')
const passwordLogin = <HTMLInputElement>document.getElementById('passwordLogin')
const usernameCreate = <HTMLInputElement>document.getElementById('usernameCreate')
const emailCreate = <HTMLInputElement>document.getElementById('emailCreate')
const passwordCreate = <HTMLInputElement>document.getElementById('passwordCreate')
const input = <HTMLInputElement>document.querySelector('input[name="profilePic"]:checked')
const postMessage = <HTMLInputElement>document.getElementById('msg')
const postTitle = <HTMLInputElement>document.getElementById('nme')
// #endregion
createPostSubmit?.addEventListener('click', async (e)=>{
  e.preventDefault()
  const username= getCookie()
  const dateGet = new Date()
  const date = dateGet.toString()
  const time = dateGet.getTime()
  createPost(postMessage.value, username, postTitle.value, date, time)
})
loginTryBtn?.addEventListener('click', async ()=>{
  console.log(usernameLogin.value)
  if(await checkLogin(usernameLogin.value, passwordLogin.value) === true){
    setCookie(usernameLogin.value)
    profileShow?.classList.remove('inactive')
    contentHolder?.classList.remove('inactive')
    logInForm?.classList.add('inactive')
    createPostForm?.classList.add('inactive')
    loggedinAs?.classList.remove('inactive')
    createNewPostBtn?.classList.remove('inactive')
    welcomeText?.classList.add('inactive')
    logInBtn?.classList.add('inactive')
    createFormBtn?.classList.add('inactive')
    contentHolder?.classList.remove('inactive')
    logOutBtn?.classList.remove('inactive')
    currentFeed = getCookie()
    checkCurrentProfile(currentFeed)
    getPost(currentFeed)
    loggedinAs.innerText = `Inloggad som: ${currentFeed}`
  }else{
    return
  }
})
createSubmit?.addEventListener('click', ()=>{
  checkUsernameExists(usernameCreate?.value)
  
})

function checkInputCreate(username:string, email:string, password:string, profile:number): void {
  if(username == "" || email == "" || password == ""){
    alert("please fill out all fields")
  }else{
    let createUser: {saveToFirebase():void} = new UserCreator.User( username, email, password, profile)
    createUser.saveToFirebase()
    loginCreate?.classList.add('inactive')
    logInForm?.classList.remove('inactive')
    console.log(createUser)
  }
}
function createPost(message:string, username:string, title:string, date:string, time:number): void {
  if(message == "" || title == ""){
    alert("please fill out all fields")
  }else{
    let createUser: {saveToFirebase():void} = new postCreator.post( username, date, message, title, time)
    createUser.saveToFirebase()
    console.log(createUser)
  }
}
const checkLogin = async(username:string, password:string):Promise<boolean|undefined> =>{
  console.log(username)
  try {
    let config = {
      headers:{
        'crossorigin': 'true',
        'Access-Control-Allow-Origin':'true'
      }
    }
    const response = await axios.get(`https://socialmedia-49567-default-rtdb.europe-west1.firebasedatabase.app/users/${username}.json`, config);
    const data = response.data;
    console.log(data)
    if(data == null){
      alert("username does not exist")
      return
    }else{
      if(data.username == username && data.password == password){
        console.log("whalecum")
        // document.cookie = "username="
        return true
      }else{
        alert("no username with that password exists")
        
        return false
      }
    }
  } catch (error) {
    console.error(error);
  }
}
const getPost = async (username:string): Promise<void> => {
 
const endpoint = 'https://socialmedia-49567-default-rtdb.europe-west1.firebasedatabase.app/posts/.json';


interface Post {
  date: string;
  message: string;
  time: number;
  title: string;
  username: string;
}


axios.get(endpoint)
  .then(async(response) => {
    const posts: { [key: string]: Post } = response.data;
    
    
    const filteredPosts = Object.keys(posts)
      .map((key) => ({ id: key, ...posts[key] }))
      .filter((post) => post.username === username);
    if(filteredPosts.length == 0){
      return 
    }else{
      
      const imgChoice = await addImgToPosts(username)
      console.log(imgChoice)
      filteredPosts.forEach(posts => {
        
        const post = document.createElement('div')
        post.classList.add('post')
        const postTextDiv= document.createElement('div')
        const postHeader = document.createElement('div')
        postHeader.classList.add('postHeader')
        postTextDiv.appendChild(postHeader)
        const date = document.createElement('p')
        const author = document.createElement('h2')
        date.innerText = `${posts.date}`
        author.innerText = `Användare: ${posts.username}`
        postHeader.appendChild(date).appendChild(author)
        postContainer?.appendChild(post)
        const message = document.createElement('p')
        const imgContainer = document.createElement('div')
        const img: any= document.createElement('img')
        imgContainer?.appendChild(img)
        const imgUrl = new URL(`../images/garf${imgChoice}.jpg`, import.meta.url)
        img.src = imgUrl
        message.innerText = `${posts.message}`
        post.appendChild(imgContainer)
        postTextDiv.appendChild(message)
        post.appendChild(postTextDiv)

      })
    }
    console.log(filteredPosts);
  })
  .catch((error) => {
    console.error(error);
  });
}
getPost(currentFeed)
const checkUsernameExists = async (username:string): Promise<void> => {
  try {
    let config = {
      headers:{
        'crossorigin': 'true',
        'Access-Control-Allow-Origin':'true'
      }
    }
    const response = await axios.get(`https://socialmedia-49567-default-rtdb.europe-west1.firebasedatabase.app/users/${username}.json?`, config);
    const data = response.data;
    console.log(username, data)
    if(!data){
      checkInputCreate(usernameCreate?.value, emailCreate?.value, passwordCreate?.value, Number(input?.value))
    }else{
      alert("username already taken")
    }
  } catch (error) {
    console.error(error);
  }
}

function getCookie():string {
  let name = "username=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  console.log(ca)
  console.log(decodedCookie)
  return "";
}

function setCookie(uvalue: string):void {
  const d = new Date();
  d.setTime(d.getTime() + (24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = "username=" + uvalue + ";" + expires + ";path=/";
}
// document.cookie = "username=" + "shinsu" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;"
function checkCurrentProfile(cookie: string): void {
  if(cookie === currentFeed){
    profileh1.innerText = `Du kollar på din egna feed`
  }else{
    profileh1.innerText = `Du kollar på ${currentFeed}'s feed`
  }
}
function checkCookie(): void{
  let cookie = getCookie()
  if(cookie === ""){
    profileShow?.classList.add('inactive')
    contentHolder?.classList.add('inactive')
    createPostForm?.classList.add('inactive')
    loggedinAs?.classList.add('inactive')
    createNewPostBtn?.classList.add('inactive')
    logOutBtn?.classList.add('inactive')
  }else{
    profileShow?.classList.remove('inactive')
    contentHolder?.classList.remove('inactive')
    logInForm?.classList.add('inactive')
    createPostForm?.classList.add('inactive')
    loggedinAs?.classList.remove('inactive')
    createNewPostBtn?.classList.remove('inactive')
    welcomeText?.classList.add('inactive')
    logInBtn?.classList.add('inactive')
    createFormBtn?.classList.add('inactive')
    loggedinAs.innerText = `Inloggad som: ${cookie}`
    checkCurrentProfile(cookie)
  }
}
const addImgToPosts = async(username: string): Promise<number | undefined> =>{
  try{
    const response = await axios.get(`https://socialmedia-49567-default-rtdb.europe-west1.firebasedatabase.app/users/${username}.json`)
    const data = response.data
    console.log(data)
    switch (data.img) {
      case 1:
        console.log("You chose option 1");
        return 1
        break;
      case 2:
        console.log("You chose option 2");
        return 2
        break;
      case 3:
        console.log("You chose option 3");
        return 3
        break;
      case 4:
        console.log("You chose option 4");
        return 4
        break;
      default:
        console.log("Invalid option");

  }
}catch{
  console.log("ergor")
}
}
checkCookie()
console.log(document.cookie)
// #region nospaceallowed
const formTextFields = document.getElementsByClassName('noSpaces');
for(let i = 0; i < 5; i++){
  formTextFields[i].addEventListener('keypress', function(e){
    let keyboardEvent = <KeyboardEvent> e
        if (keyboardEvent.code === 'Space') {
          console.log(keyboardEvent.code)
          e.preventDefault();
        }
      })
}

// #endregion