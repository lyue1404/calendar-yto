
import Vue from 'vue';
import axios from 'axios';

let env = process.env.NODE_ENV;
let baseURL = '';
if (env !== 'development') {
  baseURL = process.env.BASE_API;
}

const service = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  responseType: 'json',
});

const getToken = () => {
  return sessionStorage.getItem("accessToken");
};

export function post(url, params, config = {}) {
  let configArry = getToken() ? Object.assign(config, { headers: { USER_TOKEN_CAPI: `JSC_${getToken()}`}}) : config;
  return new Promise((resolve, reject) => {
    service.post(url, params, configArry).then((response) => {
      if (!response) {
        reject(new Error(`ajax ${url} request fail`));
      } 
      // else if(response.data.status == -1){
      //   window.webkit.messageHandlers.gotoLogin.postMessage(null)
      // } 
      else{
        resolve(response.data);
      }
    }, (err) => {
      console.log(err);
      reject(err);
    }).catch((error) => {
      reject(error);
    });
  });
}

export function get(url,  config = {}) {
    let configArry = getToken() ?  Object.assign(config, { headers: { USER_TOKEN_CAPI: `JSC_${getToken()}`}}) :
    Object.assign(config);
  return new Promise((resolve, reject) => {
    service.get(url, configArry)
      .then((response) => {
        if (!response) {
          console.log('post------------------------------------------------------post');
          reject(new Error(`ajax  ${url} request fail`));
        } 
        // else if(response.data.status == -1){
        //   window.webkit.messageHandlers.gotoLogin.postMessage(null)
        // } 
        else{
          resolve(response.data);
        }
      }, (err) => {
        reject(err);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
