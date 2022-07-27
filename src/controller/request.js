const express = require('express');
const router = express.Router();
const {  clusterApiUrl,Connection,PublicKey, Keypair,LAMPORT_PER_SOL, LAMPORTS_PER_SOL} = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount,mintTo, transfer, Account, getMint, getAccount} = require("@solana/spl-token");
const  bs58 = require("bs58");
const dotenv = require('dotenv');

dotenv.config();

const Payer = require('../models/payer');
const Request = require("../models/request");
const User = require("../models/user");

exports.createRequest = async(req, res) => {
    const organiserName = req.body.organiserName;
    const organiserWallet = req.body.organiserWallet;
    const token = req.body.token;
    const amount = req.body.amount;
    const existing = req.body.existing;
    const data = {
        organiserName,
        organiserWallet,
        token,
        existing,
        amount
    }
    Request.create(
        data
        ,(err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result})
            }
        })
}

exports.getAllRequest = async (req,res) => {
    Request.find({}
        ,
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({status:true, data:result})
            }
        }
    )
}

exports.getAllRequestByWallet = async (req,res) => {
    const organiserWallet = req.body.organiserWallet;
    Request.find({
        organiserWallet
    }
        ,
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({status:true, data:result})
            }
        }
    )
}

exports.acceptRequestToken = async (req, res) => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));
    const requestData = req.body.requestData;
    const tokenId = new PublicKey(req.body.requestData.token.tokenId);
    const toWallet = new PublicKey(requestData.organiserWallet);
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
        payer.publicKey,
        (parseInt(requestData.amount)*1000000000)
        
      );
    
    Request.findOneAndUpdate(
        {
            _id:requestData._id
        },
        {
            $set:{status:"success",signature}
        },
        (err,result) => {
            if(err){

            }else{
                const tokenOwnBy = {
                    tokenId:requestData.token.tokenId,
                    tokenName:requestData.token.tokenName,
                    address:toTokenAccount.address.toBase58()
                }
                User.findOneAndUpdate(
                    {walletPublicKey:requestData.organiserWallet},
                    {$push:{token:tokenOwnBy}},
                    (err,resultUpdate) => {
                        if(err){

                        }else{
                            const data = {
                                tokenId:requestData.token.tokenId,
                                signature: signature,
                            }
                            return res.status(200).send({success:true, data})
                        }
                    }
                )                
            }
        }
    )

}

exports.acceptRequestExistingToken = async (req, res) => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));
    const requestData = req.body.requestData;
    const tokenId = new PublicKey(req.body.requestData.token.tokenId);
    const toWallet = new PublicKey(requestData.organiserWallet);
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
        payer.publicKey,
        (parseInt(requestData.amount)*1000000000)
        
      );
    
    Request.findOneAndUpdate(
        {
            _id:requestData._id
        },
        {
            $set:{status:"success",signature}
        },
        (err,result) => {
            if(err){

            }else{
                const data = {
                    tokenId:requestData.token.tokenId,
                    signature: signature,
                }
                return res.status(200).send({success:true, data})
                
            }
        }
    )
    

}