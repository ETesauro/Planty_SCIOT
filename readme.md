# **Planty**: Serverless Computing For IoT Project

## Summary

[- Introduction](#Introduction): brief introduction to the problem\
[- Architecture](#Architecture): architecture of the idea\
[- Project structure](#Project-structure): how the project is organized\
[- Getting started](#Getting-started): guide to run the project

## Introduction

This is a project for the exam of Serverless Computing for IoT.

The idea is to **simulate a moisture sensor** placed in a pot of a plant **to warn** the user **when the humidity of the pot is too low**.\
When the user is notified, **he can choose what to do** from a Telegram bot which is one thing among the following:

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

## Getting started

> **NOTE** All of these commands, except those concerning dockers, must be executed from the **root of the project**.

### Docker RabbitMQ:

```sh
docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
```

### Docker Nuclio:

```sh
docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
```

### Install all dependencies

```sh
npm install
```

### Start Telegram Bot

```sh
node src/telegram_bot.js
```

### Start Logger

```sh
node src/logger.js
```
