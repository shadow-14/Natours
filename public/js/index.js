
import {login,logout,signUp} from './login.js'
import '@babel/polyfill'
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings.js';
import { showAlert, hideAlert } from './alerts';
import { bookTour } from './stripe.js';


const SignUpform = document.querySelector('.form--signupform')
const logoutBtne = document.querySelector('.nav__el--logout');
const mapbox = document.getElementById('map');
const loginform = document.querySelector('.form--login');
const userDataform = document.querySelector('.form-user-data');
const UserPasswordForm = document.querySelector('.form-user-settings')
 const bookBtn = document.getElementById('book-tour');
// Dom elementsw
if(mapbox){
// console.log("hello from the client side")
const locations = JSON.parse(document.getElementById('map').dataset.locations);

displayMap(locations);}
if(loginform){loginform.addEventListener('submit',e=>{
    e.preventDefault();
    
 const email = document.getElementById('email').value;
 const password = document.getElementById('password').value;
    login(email,password);
})}


if(logoutBtne ){logoutBtne.addEventListener('click',logout);}



if(SignUpform){
    SignUpform.addEventListener('submit',e=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
        signUp(name,email,password,passwordConfirm);

})}








if(userDataform){
    userDataform.addEventListener('submit',e=>{
    e.preventDefault();
    const form = new FormData();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    form.append('name',name);
    form.append('email',email);
    form.append('photo',document.getElementById('photo').files[0]);
    updateSettings(form,'data');
})}


if(UserPasswordForm){
    UserPasswordForm.addEventListener('submit',async e=>{
    e.preventDefault();
    document.querySelector('.btn--pass').textContent='Updating.....';
    const currentpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({currentpassword,password,passwordConfirm},'password');

   document.getElementById('password-current').value='';
   document.getElementById('password').value='';
   document.getElementById('password-confirm').value='';
   document.querySelector('.btn--pass').textContent='Save Password';
})
}

if(bookBtn){
    bookBtn.addEventListener('click',e=>{
        e.target.textContent="Processing ......"
    const tourId = bookBtn.getAttribute('data-tour-id');
        bookTour(tourId);
        

    })
}


const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage!='undefined')showAlert('success',alertMessage,20);