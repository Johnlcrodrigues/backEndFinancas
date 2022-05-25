const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const cors = require('cors');


app.use(cors({ origin: '*' }));
app.use(bodyParser.json());


//CADASTROS DE USUARIOS
app.post('/usuarios', async (req, res) => {
    try {
        if (req.body.usuario && req.body.senha) {
            const hash = bcrypt.hashSync(req.body.senha);

            await client.connect();
            const usuarios = client.db('stim').collection('usuarios');
            await usuarios.insertOne(
                {
                    usuario: req.body.usuario,
                    senha: hash
                }
            );
            await client.close();

            return res.status(201).json({ msg: 'O usuário foi criado com sucesso.' });
        }

        return res.status(400).json({ msg: 'Os dados não foram enviados corretamente.' });
    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
            return res.status(422).json({ msg: 'O usuário já existe.' });
        }

        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});


//RECEITAS
//Delete RECEITAS
app.delete('/receitas/:id', async (req, res) => {
    try {
        await client.connect();
        const receitas = client.db('stim').collection('receitas');
        const resultado = await receitas.deleteOne({ _id: ObjectId(req.params.id) });

        if (resultado.deletedCount > 0) {
            res.json({ msg: 'Registro deletado' });
        } else {
            res.json({ msg: 'Não encontrado.' });
        }

        await client.close();
    } catch {
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//Editar RECEITAS 
app.put('/receitas/:id', async (req, res) => {
    try {
        await client.connect();
        const receitas = client.db('stim').collection('receitas');
        const resultado = await receitas.replaceOne({ _id: ObjectId(req.params.id) }, { nome: req.body.nome, valor: req.body.valor });

        if (resultado.modifiedCount === 1) {
            res.json({ msg: ' Editado com sucesso.' })
        } else {
            res.json({ msg: 'Não editado' });
        }

        await client.close();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//CADASTRO DE RECEITAS
app.post('/receitas', async (req, res) => {
    try {

        await client.connect();
        const receitas = await client.db('stim').collection('receitas');
        await receitas.insertOne(
            {
                nome: req.body.nome,
                valor: req.body.valor
            }
        );
        await client.close();

        return res.status(201).json({ msg: 'A Receita foi criada com sucesso.' });


    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
            return res.status(400).json({ msg: 'Os dados não foram enviados corretamente.' });
        }

        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//RETORNA RECEITAS
app.get('/receitas', async (req, res) => {

    if (req.query.id) {
        for (let i = 0; i < receitas.length; i++) {
            if (Number(req.query.id) === receitas[i].id) {
                return res.json({ receitas: receitas[i] });
            }
        }

        return res.json({ msg: 'despesas não encontradas.' });
    } else {
        try {
            await client.connect();
            const receitas = await client.db('stim').collection('receitas');
            const resultados = await receitas.find();

            if (await resultados.count() > 0) {
                const arrayResultado = [];
                await resultados.forEach((doc) => {
                    arrayResultado.push(doc);
                });

                res.json({ receitas: arrayResultado });
            } else {
                res.status(404).json({ msg: 'Receita não encontrado.' });
            }

            await client.close();
        } catch (e) {
            console.log(e);
            return res.status(500).json({ msg: 'Deu problema. F' });
        }
    }
});

//login
app.post('/usuarios/login', async (req, res) => {
    try {
        if (req.body.usuario && req.body.senha) {
            await client.connect();
            const usuarios = client.db('stim').collection('usuarios');
            const usuario = await usuarios.findOne({ usuario: req.body.usuario });

            if (usuario) {
                const ehIgual = bcrypt.compareSync(req.body.senha, usuario.senha);
                if (ehIgual) {


                    res.json({ msg: 'O usuário está autenticado.' });
                } else {
                    res.status(401).json({ msg: 'O usuário ou senha estão errados.' })
                }
            } else {
                res.status(404).json({ msg: 'O usuário não foi encontrado.' });
            }

            return await client.close();
        }

        return res.status(400).json({ msg: 'Os dados não foram enviados corretamente.' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//Delete Despesas
app.delete('/despesas/:id', async (req, res) => {
    try {
        await client.connect();
        const despesas = client.db('stim').collection('despesas');
        const resultado = await despesas.deleteOne({ _id: ObjectId(req.params.id) });

        if (resultado.deletedCount > 0) {
            res.json({ msg: 'Registro deletado' });
        } else {
            res.json({ msg: 'Não encontrado.' });
        }

        await client.close();
    } catch {
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//Editar Despesas 
app.put('/despesas/:id', async (req, res) => {
    try {
        await client.connect();
        const despesas = client.db('stim').collection('despesas');
        const resultado = await despesas.replaceOne({ _id: ObjectId(req.params.id) }, { nome: req.body.nome, valor: req.body.valor });

        if (resultado.modifiedCount === 1) {
            res.json({ msg: ' Editado com sucesso.' })
        } else {
            res.json({ msg: 'Não editado' });
        }

        await client.close();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//CADASTRO DE DESPESAS
app.post('/despesas', async (req, res) => {
    try {

        await client.connect();
        const despesas = await client.db('stim').collection('despesas');
        await despesas.insertOne(
            {
                nome: req.body.nome,
                valor: req.body.valor
            }
        );
        await client.close();

        return res.status(201).json({ msg: 'A Despesa foi criada com sucesso.' });


    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
            return res.status(400).json({ msg: 'Os dados não foram enviados corretamente.' });
        }

        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//RETORNA DESPESAS
app.get('/despesas', async (req, res) => {

    if (req.query.id) {
        for (let i = 0; i < despesas.length; i++) {
            if (Number(req.query.id) === despesas[i].id) {
                return res.json({ despesas: despesas[i] });
            }
        }

        return res.json({ msg: 'despesas não encontradas.' });
    } else {
        try {
            await client.connect();
            const despesas = await client.db('stim').collection('despesas');
            const resultados = await despesas.find();

            if (await resultados.count() > 0) {
                const arrayResultado = [];
                await resultados.forEach((doc) => {
                    arrayResultado.push(doc);
                });

                res.json({ despesas: arrayResultado });
            } else {
                res.status(404).json({ msg: 'Jogo não encontrado.' });
            }

            await client.close();
        } catch (e) {
            console.log(e);
            return res.status(500).json({ msg: 'Deu problema. F' });
        }
    }
});

app.listen(port, async () => {
    try {
        await client.connect();
        await client.db('stim').command({ ping: 1 });
        console.log("Base de dados conectada!");
        await client.close();
    } catch (e) {
        console.log(e);
    }
});