
import axios  from 'axios';
import { showAlert, hideAlert } from './alerts';

export const login = async (email, password) => {
//   alert(email);
    try{
  const result =  await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {email, password},
    })
    if(result.data.status === 'success'){
        showAlert("success","Logged in successfully");
        window.setTimeout(() =>{
            location.assign('/')
        },1500);
    }
//    console.log(result)
}
   catch(err){
    showAlert("error",err.response.data.message);
   }
};

export const logout = async()=>{
    try{
    const result = await axios({
        method: 'GET',
        url: '/api/v1/users/logout',
    });
    if(result.data.status ==='success'){
    showAlert("success","Logged out successfully");
    location.reload(true);
    location.assign('/');
    //reload from server
    }
    }
    catch(err){
        showAlert("error","Error Logging out! Try again");
    }
} 


export const signUp = async (name,email, password,passwordConfirm) => {
    
        try{
      const result =  await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {name,email, password,passwordConfirm},
        })
        if(result.data.status === 'success'){
            showAlert("success","SignUp  successfully");
            window.setTimeout(() =>{
                location.assign('/')
            },1500);
        }
    //    console.log(result)
    }
       catch(err){
        showAlert("error",err.response.data.message);
       }
    };