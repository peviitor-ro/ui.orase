if(document.querySelector('#api-map') !== null) {
    const map = document.querySelector('.map');
} 

const url = "https://orase.peviitor.ro";

async function apiOrase(){
    try{
        const api = await fetch(url);
        const response = await api.json();
        console.log(response);
    } catch (er) {
        console.log(er);
    }
}

apiOrase();