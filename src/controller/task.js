const express = require('express');
const router = express.Router();
const {  clusterApiUrl,Connection,PublicKey, Keypair,LAMPORT_PER_SOL, LAMPORTS_PER_SOL} = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount,mintTo, transfer, Account, getMint, getAccount} = require("@solana/spl-token");
const  bs58 = require("bs58");

const Task = require("../models/task");
const User = require('../models/user');

const dotenv = require('dotenv');
dotenv.config();

exports.createTask = (req,res) => {
    const title = req.body.title;
    const maxParticipant = req.body.maxParticipant;
    const deadline = req.body.deadline;
    const urlList = req.body.urlList;
    const organiserId= req.body.organiserId;
    const data = {
        organiserId,
        title,
        maxParticipant,
        deadline,
        urlList
    }

    Task.create(
        data,
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result})
            }
        }
    )
}

exports.getTaskListByOrganiserId = async (req,res) => {
    const organiserId = req.body.organiserId;

    Task.find(
        {organiserId},
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result})
            }
        }
    )
}

exports.getAllTaskList = async (req,res) => {
    const organiserId = req.body.organiserId;

    Task.find(
        {},
        (err,result) => {
            if(err){

            }else{
                return res.status(200).send({success:true, data:result})
            }
        }
    )
}

exports.getTaskById = async(req,res) => {
    const _id = req.body._id;

    Task.findById(_id,
        (err,result) => {
            if(err) {

            }else{
                return res.status(200).send({success:true, data:result})
            }
        })
}

exports.submitTask = async(req,res) => {
    const accountData = req.body.accountData;
    const answer = req.body.answer;
    const taskData = req.body.taskData;

    const newAccountData={
        _id:accountData._id,
        name:accountData.name,
        walletPublicKey: accountData.walletPublicKey,
        walletSecretKey: accountData.walletSecretKey,
    }

    const data = {
        accountData:newAccountData,
        answer,
        status:false
    }

    const taskDone = {
        taskId:taskData._id,
        taskTitle:taskData.title,
        status:"Waiting Result",
        reward:"None",

    }

    Task.findOneAndUpdate(
        {_id:taskData._id},
        {$push:{response:data}},
        (err,result) => {
            if(err){

            }else{
                User.findOneAndUpdate(
                    {_id:accountData._id},
                    {$push:{taskDone:taskDone}},
                    (err,resultUser) => {
                        if(err){

                        }else{
                            return res.status(200).send({success:true,data:"submitted"});
                        }
                    }
                )

                
            }
        }
    )
}

exports.appreciateRespondent = async(req,res) => {
    const response = req.body.response;
    const indexResponse = req.body.indexResponse;
    const respondentData = req.body.respondentData;
    const organiserData = req.body.organiserData;
    const choosenToken = req.body.choosenToken;
    const amount = req.body.amount;
    const taskId = req.body.taskId;

    const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYERSECRETKEY));
    const tokenId = new PublicKey(choosenToken.tokenId);
    const owner = Keypair.fromSecretKey(bs58.decode(organiserData.walletSecretKey));
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const toWallet = new PublicKey(respondentData.walletPublicKey);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenId,
        toWallet);
        const ownerPK = new PublicKey(organiserData.walletPublicKey);
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

        const items = {
            accountData:respondentData,
            answer:response,
            status:true
        }
        const path = "response"

        Task.findOneAndUpdate({
            _id:taskId,
        },
        {
            $set:{['response.'+indexResponse]:items}
        },
        (err,result)=>{
            if(err){
               
            }else{
                User.findOneAndUpdate(
                    {_id:respondentData._id,
                    },
                    {
                        "$set":{['taskDone.$[outer].status']:"Appreciated"},
                        "$set":{['taskDone.$[outer].status']:"Appreciated",['taskDone.$[outer].reward']:amount+" "+choosenToken.name}
                    },
                    {
                        "arrayFilters":[{"outer.taskId":taskId}]
                    },
                    (err,resultUpdate) => {
                        if(err){
                        }else{
                           User.findOne(
                            {_id:respondentData._id,
                                token:{$elemMatch:{tokenId:choosenToken.tokenId}}
                            },
                            (err,resultCheck) => {
                                if(err){

                                }else{
                                    // console.log(resultCheck)
                                    if(resultCheck === null){
                                        User.findOneAndUpdate(
                                            {_id:respondentData._id},
                                            {
                                                $push:{token:{tokenId:choosenToken.tokenId,tokenName:choosenToken.name,address:toTokenAccount.address.toBase58()}}
                                            },
                                            (err,resultUpdateddd) => {
                                                if(err){

                                                }else{
                                                    return res.status(200).send({success:true, data:"Apprediated Successfully"})
                                                }
                                            }
                                        )
                                    }else{
                                        return res.status(200).send({success:true, data:"Apprediated Successfully"})
                                    }
                                }
                            }
                           )
                        }
                    }
                )
                
            }
        }
        )

}