const express = require('express');
const router = express.Router();
const Payer = require('../models/payer');
const Token = require("../models/token");
const {  clusterApiUrl,Connection,PublicKey, Keypair,LAMPORT_PER_SOL, LAMPORTS_PER_SOL} = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount,mintTo, transfer, Account, getMint, getAccount} = require("@solana/spl-token");
const  bs58 = require("bs58");
const { json } = require('body-parser');
const User = require('../models/user');
const dotenv = require('dotenv');

dotenv.config();

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
exports.createToken = async(req, res) => {
    const payerScretKey = req.body.payerSecretKey;
    const name = req.body.name;
    const walletHolder = new PublicKey(req.body.holderWallet);
    
    const payer = await Keypair.fromSecretKey(bs58.decode(payerScretKey));
    const tokenId = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        9
    );

    const ownToken = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenId,
        walletHolder
    );
    const tokenOwnBy = {
        tokenId:tokenId.toBase58(),
        tokenName:req.body.name,
        address:ownToken.address.toBase58()
    }
    
    const data = {
        name,
        tokenId
    }
    Token.create(data
        ,async(err,result) =>{
            if(err){

            }else{
                User.findOneAndUpdate({
                    walletPublicKey:req.body.holderWallet
                },{
                    $push:{token:tokenOwnBy}
                },
                (err,resultChange) => {
                    if(err){

                    }else{
                        return res.status(200).send({success:true,data:result})
                    }
                })
                
            }
        })
}

exports.getTokenList = async (req,res) => {
    const _id = req.body._id;
    let newArray = [];
    User.findById(
        _id,
        async(err,result) => {
            if(err){

            }else{
                if(result.token.length > 0){
                    for(let i=0; i< result.token.length;i++){
                        const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));
                        const walletHolder = new PublicKey(result.walletPublicKey);
                        const tokenId = new PublicKey(result.token[i].tokenId)
                        const ownToken = await getOrCreateAssociatedTokenAccount(
                            connection,
                            payer,
                            tokenId,
                            walletHolder
                        );
                        const amount = ownToken.amount.toString();
                        const token = {
                            name:result.token[i].tokenName,
                            amount:(parseInt(amount)/1000000000),
                            tokenId:result.token[i].tokenId
                        }
                        newArray.push(token)
                        
                    }
                    
                    return res.status(200).send({success:true, data:newArray})
                }else{
                    return res.status(200).send({success:true, data:[]})
                }
                
            }
        })
}

exports.mintingToken = async (req,res) => {
    const _id = req.body._id;
    const tokenId = new PublicKey(req.body.tokenId);
    const amount = (parseInt(req.body.amount)*1000000000);
    const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));

    User.findById(
        _id,
        async(err,resultUser) => {
            if(err){

            }else{
                const holderWallet = new PublicKey(resultUser.walletPublicKey);
                const address = await getOrCreateAssociatedTokenAccount(
                    connection,
                    payer,
                    tokenId,
                    holderWallet
                );
                const signature = await mintTo(
                    connection,
                    payer,
                    tokenId,
                    address.address,
                    payer.publicKey,
                    amount
                )
                const history = {
                    transaction : "mint",
                    from:"",
                    to:resultUser.walletPublicKey,
                    amount:amount,
                    signature
                }
                Token.findOneAndUpdate(
                    {tokenId:req.body.tokenId},
                    {
                        $push:{history:{history}}
                    },
                    (err,resultUpdateHistory) => {
                        if(err){

                        }else{
                            return res.status(200).send({success:true, data:{signature}})
                        }
                    }
                    )
            }
        }
    ) 
}

exports.getAvailableTokenList = async (req,res) => {
    Token.find({},
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result});
            }
        });
}


exports.sendTokenToPhantom = async (req,res) => {
    const phantomWallet = req.body.phantomWallet;
    const amount = req.body.amount;
    const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));
    const tokenId = new PublicKey(req.body.token.tokenId);
    const owner = Keypair.fromSecretKey(bs58.decode(req.body.holderSecretWallet));
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const toWallet = new PublicKey(phantomWallet);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenId,
        toWallet);
    const ownerPK = new PublicKey(req.body.holderWallet);
    const holderAddres = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenId,
        ownerPK);
    const address = new PublicKey(holderAddres.address.toBase58())
    const signature = await transfer(
        connection,
        payer,
        address,
        toTokenAccount.address,
        ownerPK,
        (parseInt(amount)*1000000000),
        [payer,owner]
        
      );

      return res.status(200).send({success:true,data:signature})
}