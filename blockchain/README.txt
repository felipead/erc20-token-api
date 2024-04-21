$ mkdir ./datadir
$ mkdir ./keystore
$ mkdir ./clef

---

$ clef --keystore ./keystore --configdir ./clef --chainid 21 --suppress-bootwarn init

    master password: ahJ0ieth*ah*l8shied9cheephaiCee8o

---

$ clef --keystore ./keystore --configdir ./clef --chainid 21 --suppress-bootwarn newaccount

    password: fee*je1aighae0em2die6giFaakief=ae

    INFO [04-21|01:21:40.834] Your new key was generated               address=0x7cD74E044C19CF3323bA5df5A3Dc72389dA71172
    WARN [04-21|01:21:40.835] Please backup your key file!             path=/Users/felipedornelas/nekark/erc20-token-api/blockchain/keystore/UTC--2024-04-21T04-21-38.920515000Z--7cd74e044c19cf3323ba5df5a3dc72389da71172
    WARN [04-21|01:21:40.835] Please remember your password!
    Generated account 0x7cD74E044C19CF3323bA5df5A3Dc72389dA71172

---

$ geth --datadir ./datadir/node1 --keystore ./keystore --networkid 21 init genesis.json

---

$ geth --datadir ./datadir/node1 --keystore ./keystore --syncmode "full" --networkid 21 --http --http.addr "localhost" --http.port 8545
