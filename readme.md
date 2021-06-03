# **Planty**: Serverless Computing For IoT Project

<p align="center">
<img src="doc/logo.png" alt="drawing" width="200"/>
</p>

## Summary

[- Introduction](#Introduction): brief introduction to the problem\
[- Architecture](#Architecture): architecture of the idea\
[- Project structure](#Project-structure): how the project is organized\
[- Getting started](#Getting-started): guide to run the project

## Introduction

This is a project for the exam of Serverless Computing for IoT.

The idea is to **simulate a moisture sensor** placed in a pot of a plant **to warn** the user **when the humidity of the pot is too low**.\
When the user is notified, **he can choose what to do** from a Telegram bot, which is one thing among the following:

- Water the plant remotely;
- Warn someone to water the plant.

Obviously, all these things are **simulated** because, right now, I am **not** in possession of any Iot devices.

## Architecture

As previously mentioned, one of the phases of the project is to simulate the sending of data by an Iot sensor (in this case a humidity sensor).\
In this project, this can be done in two ways:

- using the function '**_sendrandomumidity_**' on Nuclio;
- using a MQTT client from your smartphone:
  - iOS: [EasyMQTT](https://apps.apple.com/it/app/easymqtt/id1523099606)
  - Android: [MQTT Dash (IoT, Smart home)](https://play.google.com/store/apps/details?id=net.routix.mqttdash)

The data is an integer value **between 0 and 100** and indicates the **percentage of humidity of the soil** in the pot. This value is published in the queue '**iot/sensors/umidity**' of **RabbitMQ**.

When a value is published in this queue, a function on Nuclio (**_consumeumidity_**) is triggered, which processes this value. This function checks if the umidity is too low (**&le;10%**) and, if so, publish a new message in the queue '**_iot/alerts_**', otherwise log it by publishing it in the queue '**_iot/logs_**'.

At this point, inside **telegram_bot.js** the publication in **_iot/alerts_** is intercepted and a message is sent to the user thanks to a **Telegram bot**.

The user chooses what to do but, of course, the action is only simulated for the reasons mentioned in the previous paragraph.

## Project structure

- src/
  - _**telegram_bot.js**_: takes care of communication from/to bot
  - _**logger.js**_: takes care of printing both the humidity when is **not** too low, and the user’s response from the bot
- yaml_functions/
  - _**sendrandomumidity.yaml**_: takes care of sending a random value to the queue **iot/sensors/umidity**
  - _**consumeumidity.yaml**_: takes care of processing received values and to warn the user or log data
- doc/: everything related to documentation

## Getting started

> Note: Planty requires [Node.js](https://nodejs.org/) to run.

From **two different** terminals, start the docker to run RabbitMQ and Nuclio with these following commands:

- **Docker RabbitMQ**:

  ```sh
  docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
  ```

- **Docker Nuclio**:

  ```sh
  docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
  ```

- **Update and deploy Functions**:

  - Type '**localhost:8070**' on your browser to open the homepage of Nuclio;
  - Create new project and call it '_Planty_';
  - Press '**Create function**', '**Import**' and upload the two functions that are in the **yaml_functions** folder;
  - In both, **change the already present IP with your IP**;\
    **!!!Don't forget the trigger!!!**
  - Press **'Deploy'**.

- **Create personal Telegram Bot**:

  - Open Telegram and search for [BotFather](https://t.me/BotFather).
  - Press **start** and type **/newbot**.
  - Give it a **name** and a **unique id** (BotFather will help you).
  - Copy and paste the **Token** that BotFather gave you in the **Telegraf constructor** in [.env](.env) file;

- **Install all dependencies, start Telegram Bot's Server and start Logger**:

  Open again **.env** file and insert your **IP address** instead of '_INSERT_YOUR_IP_'.

  Open two more terminals and type, from the **root of the project**, on the first:

  ```sh
  npm install
  node src/telegram_bot.js
  ```

  and on the second:

  ```sh
  node src/logger.js
  ```

- **Start Telegram Bot Client**:

  Now, you can go to the bot you've just created on Telegram and run it.

  The bot will warn you not to stop it to continue receiving updates on the plant.

After all these steps, you are able to send a value using both **sendrandomumidity** on Nuclio and an **MQTT client** from your smartphone and if this value is **less than or equal to 10** you will be notified on the bot and asked to make a decision.

Below will be presented a short **demo** of the execution of the project.

## Demo

https://user-images.githubusercontent.com/21143922/120530510-e27d8e00-c3dd-11eb-89cc-c2ae72904e98.mp4
