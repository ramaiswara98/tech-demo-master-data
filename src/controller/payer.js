const express = require('express');
const router = express.Router();
const Payer = require('../models/payer');
const {  clusterApiUrl,Connection,PublicKey, Keypair,LAMPORT_PER_SOL, LAMPORTS_PER_SOL} = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount,mintTo, transfer, Account, getMint, getAccount} = require("@solana/spl-token");
const  bs58 = require("bs58");

exports.createPayer = async (req,res) => {
    const name = req.body.name;
    const secretKey = req.body.secretKey;
    const publicKey = req.body.publicKey;

    if(!(name && secretKey && publicKey )){
        res.status(200).send("Insufficient information provided.");
   }else{
        const payer = await new Payer( {
            name,
            secretKey,
            publicKey
        });

        Payer.create(payer, 
            (err,result) => {
                if(err){
                    return res.status(200).send({success:false, data:"Something Wrong !"});
                }else{
                    return res.status(200).send({success:true, data:result});
                }
            })

   }
}

exports.getPayerList = async(req,res) => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    Payer.find(async (err,result) => {
        if(err){
            return res.status(200).send({success:false, data:"Something Wrong !"});
        }else{
            const newList=[];
            for(let i=0; i< result.length;i++){
                const fromWallet = await Keypair.fromSecretKey(bs58.decode(result[i].secretKey));
                const response = await connection.getBalance(fromWallet.publicKey);
                const amount = (parseInt(response)/1000000000);
                const item = {
                    _id:result[i]._id,
                    name:result[i].name,
                    secretKey:result[i].secretKey,
                    publicKey:result[i].publicKey,
                    amount:amount
                }
                newList.push(item)
            }
            return res.status(200).send({success:true, data:newList});
        }
    })
}

exports.airdropPayer = async (req,res) => {
    const _id = req.body.id;
    const amount = req.body.amount;
    Payer.findByIdAndUpdate(
        _id,
        {amount},
        (err,result) => {
            if(err){
                return res.status(200).send({success:false, data:"Something Wrong !"});
            }else{
                return res.status(200).send({success:true, data:result});
            }
        }
        )
}