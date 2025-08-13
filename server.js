import express from 'express';
import dotenv from 'dotenv'
import axios from 'axios'
import cors from 'cors';
const app  = express();
dotenv.config();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));
app.set("view engine", "ejs");

// Config
const ENV_PORT = process.env.PORT || 2000;
const ENV_API = process.env.ENV_API || 'https://app-backend.project.felps.cc/v1';

const API = axios.create({
    baseURL: ENV_API,
    timeout: 10000, // 10 segundos
    headers: {
        'Content-Type': 'application/json',
    }
});

const ignoreUrl = [
    '/favicon.ico'           
]

app.post('/api', async (req, res) => {
    try {
        const { url } = req.body
        const data = await API({
            method: "GET",
            url: "/module/links/public/get",
            params: { url }
        })
        .then(response => ({
                status: response.status,
                data: response.data
        }))
        .catch(error => {
            return {
                status: error.response?.status || 500,
                data: error.response?.data || error?.message
            }
        })
        res.sendStatus(data.status)
    } catch (error) {
        res.status(500).json({
            message: "Erro interno na api"
        })
    }
})

app.get(/.*/, async (req, res) => {
    try {
        const check = ignoreUrl.indexOf(req.path) == -1;
        if(!check){
            return res.status(204).end(); // ou apenas res.end()
        }

        // Buscar na api
        const data = await API({
            method: "GET",
            url: "/module/links/public/get",
            params: { url: req.path }
        })
        .then(response => ({
                status: response.status,
                data: response.data
        }))
        .catch(error => {
            return {
                status: error.response?.status || 500,
                data: error.response?.data || error?.message
            }
        })
        if(data.status==200){
            if(data.data.isPage){   
                res.render('./page.ejs', {
                    title: data.data.data.title,
                    html: data.data.data.html,
                    css: '',
                    js: '',
                })
            }else{
                res.redirect(data.data.data.link);
            }
        }else{
            res.redirect('https://felps.com.br');
        }
    } catch (error) {
        console.error(error);
        res.redirect('https://felps.com.br');
    }
});

app.listen(ENV_PORT, () => {
    console.log(`🚀 Aplicação rodando na porta ${ENV_PORT}`)
})