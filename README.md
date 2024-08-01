
# **serverless-env-action**

  

## **O que é**

O serverless-env-action e um código open source criado pela Wehandle com o intuito de facilitar a inclusão de variáveis de ambiente encontradas no arquivo .env de forma dinâmica no environment do serveless.yml/ts afim de não mas necessitar a criação de variáveis ${env:variavel} nos próprios arquivos yml ou ts.

  
  

## **Como funciona**

O CI/CD main.yml chama o código dessa tool que em sequencia percorre o arquivo .env localizando as variáveis de ambiente e adiciona ao arquivo serverless.yml ou serverless.ts essas variáveis já formatadas nos padrões necessários para funcionamento nesses arquivos de forma dinâmica.

  
  

## **Como usar**

Para usar ele basta acrescentar o seguinte comando no CI/CD do github "main.yml"

```

- name: ServelessEnv Tool

uses: WeHandle/serverless-env-action@v2.0.0

```

  

[![logo wehandle](https://media.licdn.com/dms/image/D4D16AQFIB4BGcorK6g/profile-displaybackgroundimage-shrink_200_800/0/1673438633384?e=2147483647&v=beta&t=xzRfROiwovNLijtejZ6RouPxJA47AoKcWBU8yhFAcrQ)](https://wehandle.com.br/)