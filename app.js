var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
var app = express();
 
const mercadopago = require('mercadopago')
mercadopago.configure({
    access_token: 'APP_USR-2572771298846850-120119-a50dbddca35ac9b7e15118d47b111b5a-681067803',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/approved', function (req, res)  {
    res.render('approved', req.query)
});   

app.get('/pending', function (req, res)  {
    res.render('pending', req.query)
});   

app.get('/rejected', function (req, res)  {
    res.render('rejected', req.query)
});   

app.post('/ipn', function (req, res)  {
    console.log(req.body)
    // Actualizar estados de las transacciones...
    res.sendStatus(200)
});

app.post('/create_preference', function (req, res)  {
    base_url = req.protocol +'://'+req.get("host")+'/'
    picture_url_str = req.body.picture_url.substring(2)
    picture_url= base_url + picture_url_str

	let preference = {
		items: [{
			id: 1234,
            description: "Dispositivo móvil de Tienda e-commerce",
			title: req.body.description,
			unit_price: Number(req.body.price),
			quantity: 1,
            picture_url: picture_url 
		}],
		payer:{
			name: "Lalo",
			surname:"Landa",
			email: "test_user_83958037@testuser.com",
			phone:{
				area_code:"52",
				number: 5549737300
			},
            address:{
                street_name: "Insurgentes Sur",
                street_number: "1602",
                zip_code: "03940"
            },
		},
		back_urls: {
			success: base_url + "approved",
			failure: base_url + "rejected",
			pending: base_url + "pending"
		},
		auto_return: "approved",
        payment_methods: { 
            excluded_payment_methods: [
                {
                    id: "amex"

                }
            ],
            excluded_payment_types: [
                {
                    id: "atm"

                }
            ],
            installments: 6
        },
        external_reference: "nesh.diaz@gmail.com",
        notifications_url: base_url + "ipn"
        
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {
            console.log(response.body)
            res.redirect(response.body.init_point)
        }).catch(function (error) {
            console.log(error);
        });
});

app.listen(port);
