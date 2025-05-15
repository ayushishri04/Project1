const https = require('https');
const fs = require('fs');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

// Create images directory if it doesn't exist
if (!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
}

// Download sample images from Unsplash
const images = [
    {
        url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        name: 'hero-bg.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1538964173425-93884d739596',
        name: 'bali.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
        name: 'santorini.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        name: 'tokyo.jpg'
    }
];

// Download all images
Promise.all(
    images.map(img => 
        downloadImage(img.url, `./images/${img.name}`)
        .then(() => console.log(`Downloaded: ${img.name}`))
        .catch(err => console.error(`Error downloading ${img.name}:`, err))
    )
).then(() => console.log('All downloads completed!'));