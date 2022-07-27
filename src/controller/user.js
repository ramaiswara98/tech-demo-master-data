const express = require('express');
const router = express.Router();
const {  clusterApiUrl,Connection,PublicKey, Keypair,LAMPORT_PER_SOL, LAMPORTS_PER_SOL} = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount,mintTo, transfer, Account, getMint, getAccount} = require("@solana/spl-token");
const  bs58 = require("bs58");

const User = require('../models/user');

exports.createUser = async(req,res,next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const wallet =req.body.wallet;
    const isAdmin = req.body.isAdmin;
    const isOrganiser = req.body.isOrganiser;
    const isUser = req.body.isUser;

    if(!(name && email && password && wallet)){
         res.status(200).send("Insufficient information provided.");
    }else{
        const wallet = await Keypair.generate();
        const walletPublicKey = wallet.publicKey.toBase58();
        const walletSecretKey = bs58.encode(new Uint8Array(wallet.secretKey));
        const user = await new User({
            name,
            email,
            password,
            walletPublicKey,
            walletSecretKey,
            isAdmin,
            isOrganiser,
            isUser
        });
        User.create(user, (err,result) =>{
            if(err){

            }else{
                return res.status(200).send({success:true, data:result});
            }
        })
    }
  
}

exports.loginUser = (req,res) => {
    const email = req.body.email;
    const password =req.body.password;

    if(!(email && password)){

    }else{
        User.find(
            {email},
            (err,result) => {
                if(err){

                }else{
                    if(result.length > 0){
                        if(result[0].password == password){
                            return res.status(200).send({success:true, data:result});
                        }else{
                            return res.status(200).send({success:false, data:"Your password and email does'nt match"});
                        }
                    }else{
                        return res.status(200).send({success:false, data:"Your Email not register yet"});
                    }
                    
                }
            }
            )
    }
    
}

exports.getUserById = (req,res) => {
    const _id = req.body._id;

    User.findById(_id,
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result})
            }
        })
}
