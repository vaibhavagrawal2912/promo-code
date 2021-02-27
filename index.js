const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;
const coupon = require('./js/backend')();


app.use(express.static(`${__dirname}/js`));
app.use(cors(), (req, res, next) => {
    if (req.headers.origin === 'http://localhost:4200') {
        next();
    } else {
        res.sendStatus(403)
    }
})

app.get('/', (req, res) => {
    res.send('OK')
});

app.get('/genratePromoCode', (req, res) => {
    let ammount = +req.query.ammount,
        expiryTime = req.query.expiryTime,
        promoCodeRadius = +req.query.promoCodeRadius,
        promoCodeActivation = req.query.promoCodeActivation == true;
    fs.readFile('./data/dataJson.json', (err, data) => {
        if (err) {
            res.sendStatus(500);
        }
        let code = coupon.generateCode();
        if (code) {
            let fileData = JSON.parse(data);
            fileData.push({
                code: code,
                radius: promoCodeRadius,
                isActivated: promoCodeActivation,
                amount: ammount,
                expiryTime: expiryTime
            })
            fs.writeFile('./data/dataJson.json', JSON.stringify(fileData), (err, data) => {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.send({
                        code: code
                    });
                }
            });
        }
    });
});

app.get('/getAllPromoCodes', (req, res) => {
    fs.readFile('./data/dataJson.json', (err, dataFile) => {
        if (err) {
            res.sendStatus(500);
        }
        if (req.query.isActive == 'undefined') {
            res.send(JSON.parse(dataFile));
        } else {
            res.send(JSON.parse(dataFile).filter(item => item.isActivated === !!req.query.isActive))
        }
    });
});

app.get('/validate', (req, res) => {
    fs.readFile('./data/dataJson.json', (err, dataFile) => {
        if (err) {
            res.sendStatus(500);
        }
        const center = 30;
        let data = JSON.parse(dataFile),
            promoObject = data.find(item => item.code == req.query.code) || {},
            origin = req.query.origin.split(','),
            dest = req.query.dest.split(',');
        if (promoObject && promoObject.isActivated &&
            (Math.pow((+origin[0] - center), 2) + Math.pow((+origin[1] - center), 2) < Math.pow(promoObject.radius || 0, 2)) &&
            (Math.pow((+dest[0] - center), 2) + Math.pow((+dest[1] - center), 2) < Math.pow(promoObject.radius || 0, 2))) {
            res.send({
                polyLine: `${req.query.origin || '20,40'} 40,25 60,40 80,120 120,140 ${req.query.dest || '200,200'}`,
                message: 'Valid',
                success: true
            })
        } else {
            let message = 'Out of range';
            if ((origin[0] && origin[0] == 'undefined') || (origin[1] && origin[1] == 'undefined')) {
                message = 'Please add origin';
            }
            if ((dest[0] && dest[0] == 'undefined') || (dest[1] && dest[1] == 'undefined')) {
                message = 'Please add destination';
            }
            if (promoObject && !promoObject.code) {
                message = 'Plese provide Promo Code';
            }
            if (promoObject && !promoObject.isActivated) {
                message = 'Promo Code not valid';
            }
            res.send({
                success: false,
                message: message
            })
        }
    })
})

app.listen(port, () => {
    console.log(`coupon-app listening at http://localhost:${port}`)
});