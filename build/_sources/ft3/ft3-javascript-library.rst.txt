==================
Javascript library
==================

In this section, we explain how to use the client side library (``ft3-lib`` node package).
This library includes built in functions to manage accounts in the ft3-module.

Initialize Blockchain object
----------------------------

The first thing that has to be done before a blockchain can be accessed is to initialize the Blockchain object used to interact with the blockchain:

.. code-block:: javascript

  // /client/index.js
  import { Postchain } from 'ft3-lib';
  import { blockchainRID, blockchainUrl } from './configs/constants'; // these configs are set in previous section

  const chainId = Buffer.from(blockchainRID, 'hex');
  const blockchain = await new Postchain(blockchainUrl).blockchain(chainId);

Details of the initialized chain can be accessed from ``info`` property which has name, website and description properties:

.. code-block:: javascript

  console.log("-------------- Blockchain Info --------------");
  console.log("name        : ${blockchain.info.name}        ");
  console.log("website     : ${blockchain.info.website}     ");
  console.log("description : ${blockchain.info.description} ");

These fields have the values which we previously set in the ``config.template.xml`` file.

------------

The User class
--------------

The User class represents a logged in user, and is used to keep the user's key pair and authentication descriptor.

Any method that require transaction signing will need an object of this class.

We will also import SingleSignatureAuthDescriptor wich will take the account pubKey and the flags from the single_sig entity as parameters.

.. code-block:: javascript

  import { SingleSignatureAuthDescriptor, User, FlagsType } from 'ft3-lib';

  ...

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );
  const user = new User(keyPair, authDescriptor);

Many functions provided by Blockchain class require User object, for example:

.. code-block:: javascript

  const authDescriptor = ...;
  const user = ....;

  // gets all accounts where this authDescriptor has control over
  const accounts = await blockchain.getAccountsByAuthDescriptorId(
    authDescriptor.id,
    user
  );

In most of the cases the same User instance is used throughout an app (the "current user"). In order to avoid passing both Blockchain and User objects around in an app, the *BlockchainSession* class is introduced.

It has many of the same functions as Blockchain class, but with a difference that functions provided by the BlockchainSession don't require User parameter:

.. code-block:: javascript

  const authDescriptor = ...;
  const user = ....;

  const session = blockchain.newSession(user);
  const accounts = await session.getAccountsByAuthDescriptorId(authDescriptor.id);

AuthDescriptor Rules
~~~~~~~~~~~~~~~~~~~~

Both AuthDescriptor constructors accept an optional 3rd parameter of type ``Rules``, which define constraint for the descriptor's "valid period".

Supported constrains are:

``Rules.operationCount``
  Number of operations this authDescriptor can perform:

.. code-block:: js

  import { SingleSignatureAuthDescriptor, FlagsType, Rules } from 'ft3-lib';

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer],
    Rules.operationCount.lessOrEqual(2) // This authDescriptor is only valid for 2 operations
  );

``Rules.blockTime``
  Time period during which the authDescriptor has effect:

.. code-block:: js

  import { SingleSignatureAuthDescriptor, FlagsType, Rules } from 'ft3-lib';

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer],
    Rules.blockTime.greaterThan(Date.now() + 12 * 60 * 60 * 1000) // This authDescriptor will start working 12 hours from now
  );

``Rules.blockHeight``
  Block heigh limitation of the authDescriptor:

.. code-block:: js

  import { SingleSignatureAuthDescriptor, FlagsType, Rules } from 'ft3-lib';

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer],
    Rules.blockHeight.equal(0) // This authDescriptor is only valid when the chain was just created (0 block is in the chain)
  );

Supported operators are:

- ``lessThan``
- ``lessThanOrEqual``
- ``equal``
- ``greaterThan``
- ``greaterOrEqual``

Is it also possible to build composite rules:

.. code-block:: js

  import { SingleSignatureAuthDescriptor, FlagsType, Rules } from 'ft3-lib';

  // This authDescriptor will start working 12 hours from now and is only valid for 24 hours
  const startDate = Date.now() + 12 * 60 * 60 * 1000;
  const endDate = Date.now() + 36 * 60 * 60 * 1000;
  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer],
    Rules.blockTime.greaterThan(startDate).and.blockTime.lessThanOrEqual(endDate)
  );

--------------

The Account class
-----------------

An Account object contains:

- ``assets``: an array of ``AssetBalance`` instances.
- ``authDescriptor``: an array of ``AuthDescriptor`` instances.
- ``session``: the ``BlockchainSession`` that returned it.


Account registration
~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

  const ownerKeyPair = ...;
  const authDescriptor = new SingleSignatureAuthDescriptor(
    ownerKeyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  const account = await blockchain.registerAccount(authDescriptor, user);


More commonly the current user will be creating an account for themselves. In those cases we can simply pass ``user.authDescriptor`` into the operation:

.. code-block:: javascript

  const account = await blockchain.registerAccount(user.authDescriptor, user);

Searching accounts
~~~~~~~~~~~~~~~~~~

Accounts can be searched by account ID:

.. code-block:: javascript

  const account = await session.getAccountById(accountId);

by authentication descriptor ID:

.. code-block:: javascript

  const accounts = await session.getAccountsByAuthDescriptorId(authDescriptorId);

or by participant ID:

.. code-block:: javascript

  const accounts = await session.getAccountsByParticipantId(user.keyPair.pubKey);

For SingleSig and MultiSig account descriptors, participant ID is pubKey. Therefore this function allows to search for accounts by pubKey.

.. important::

  The difference between ``getAccountsByParticipantId`` and ``getAccountsByAuthDescriptorId`` is:

  - ``getAccountsByParticipantId`` returns all accounts where user is participant, no matter which access rights user has or which type of authentication is used to control the accounts
  - while ``getAccountsByAuthDescriptorId`` returns only accounts where user has access with specific type of authentication and authorization.

Adding authentication descriptor
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

  const newAuthDescriptor = new SingleSignatureAuthDescriptor(
    pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );
  const account = await session.getAccountById(accountId);
  await account.addAuthDescriptor(newAuthDescriptor);

Assets Management
-----------------

AssetBalance
~~~~~~~~~~~~~

Each account when queried comes with an ``account.assets`` array of AssetBalance.

An AssetBalance contain information about an Asset the account own (``assetBalance.asset``), and the amount owned (``assetBalance.amount``).

You can also get asset balance of an account by calling ``AssetBalance.getByAccountId``:

.. code-block:: js

  const balances = await AssetBalance.getByAccountId(accountId, blockchain);

or if you are interested in only one specific asset:

.. code-block:: js

  const balance = await AssetBalance.getByAccountAndAssetId(accountId, assetId, blockchain);

Asset
~~~~~

Each Asset has a ``name`` and a ``chainId``, which is the id of the chain where the asset come from.

The unique identifier of asset (``asset.id``) is generated from the hash of ``name`` and ``chainId``, so asset name is unique within a chain but different chains can have asset with the same name.

An Asset must be registered on a chain to be recognized:

.. code-block:: js

  await Asset.register(assetName, blockchainId, blockchain);

Registered assets can be queried by name:

.. code-block:: js

  const assets = await blockchain.getAssetsByName(assetName);

or by id:

.. code-block:: js

  const asset = await blockchain.getAssetById(assetId);

You can also get all assets of a chain by calling getAllAssets:

.. code-block:: js

  const assets = await blockchain.getAllAssets();

Transferring assets
~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

  const account = await session.getAccountById(accountId);
  await account.transfer(recipientId, assetId, amount);

.. note::

  Here we see that the Account class retains the same characteristic as BlockchainSession: we don't need to provide an User object to sign the transaction.

Transfer History
~~~~~~~~~~~~~~~~

.. code-block:: js

  const history = await account.getPaymentHistory();

``getPaymentHistory`` return an array of ``PaymentHistoryEntryShort``:

.. code-block:: typescript

  class PaymentHistoryEntryShort {
    readonly isInput: boolean; // true if account is the sender, false in case of receiver
    readonly delta: number; // amount transfered: negative for sender (e.g. -10), positive for receiver (e.g. 12)
    readonly asset: string;
    readonly assetId: string;
    readonly entryIndex: number;
    readonly timestamp: Date;
    readonly transactionId: string;
    readonly transactionData: Buffer;
    readonly blockHeight: number;
  }

----------------

Calling operations
------------------

Single operation
~~~~~~~~~~~~~~~~

FT3 operations and other blockchain operations can also be directly called using the Blockchain and BlockchainSession classes.

For instance, the same "adding auth descriptor" operation above can be done using:

.. code-block:: javascript

  import { op } from 'ft3-lib';

  const account = ...
  const user = ...
  const newAuthDescriptor = ...

  await blockchain.call(
    op(
      'ft3.add_auth_descriptor',
      accountId,
      user.authDescriptor.id,
      newAuthDescriptor
    ),
    user
  )

Multiple operations
~~~~~~~~~~~~~~~~~~~

The transaction builder can be used if multiple operations have to be called in a single transaction:

.. code-block:: javascript

  await blockchain.transactionBuilder()
    .add(op('foo', param1, param2))
    .add(op('bar', param))
    .buildAndSign(user)
    .post();

Previous statement creates a single transaction with both ``foo`` and ``bar`` operations, adds signers from user’s auth descriptor and signs it with user’s private key.

If more control is needed over signers and signing then build and sign functions could be used instead:

.. code-block:: javascript

  await blockchain.transactionBuilder()
    .add(op('foo', param1, param2))
    .add(op('bar', param))
    .build(signersPublicKeys)
    .sign(keyPair1)
    .sign(keyPair2)
    .post();

Instead of immediately sending a transaction after building it, it is also possible to get a raw transaction:

.. code-block:: javascript

  const rawTransaction = blockchain.transactionBuilder()
    .add(op('foo', param1, param2))
    .buildAndSign(user)
    .raw();

which can be sent to a blockchain node later:

.. code-block:: javascript

  await blockchain.postRaw(rawTransaction);

The nop operation
~~~~~~~~~~~~~~~~~

To prevent replay attack postchain rejects a transaction if it has the same content as one of the transactions already stored on the blockchain. For example if we directly call ft3.transfer operation two times, the second call will fail.

.. code-block:: javascript

  const inputs = ...
  const outputs = ...
  const user = ...

  // first will succeed
  await blockchain.call(op('ft3.transfer', inputs, outputs), user);

  // second will fail
  await blockchain.call(op('ft3.transfer', inputs, outputs), user);

To avoid transaction failing, nop operation can be added to a second transaction in order to make it differ from the first transaction.

.. code-block:: js

  import { op, nop } from 'ft3-lib';

  await blockchain.transactionBuilder()
    .add(op('ft3.transfer', inputs, outputs))
    .add(nop())
    .buildAndSign(user)
    .post();

nop() function returns nop operation with a random number as argument.

GtvSerializable interface
~~~~~~~~~~~~~~~~~~~~~~~~~

In typescript, ``op`` function is defined as:

.. code-block:: typescript

  function op(name: string, ...args: GtvSerializable[]): Operation {
      return new Operation(name, ...args);
  }

It expects arguments to implement GtvSerializable interface, i.e. to have implemented ``toGTV()`` function.

Array, Buffer, String and Number are already extended with toGTV function.

If user defined object wants to be passed to an operation, it has to implement GtvSerializable interface, e.g.

.. code-block:: js

  class Player {
    constructor(firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
    }

    toGTV() {
      return [this.firstName, this.lastName],
    }
  }

  await blockchain.call(
    op('some_op', new Player('John', 'Doe')),
    user
  )

To be able to handle the ``Player`` object, on blockchain side, ``some_op`` would have to be defined as either:

.. code-block:: rell

  operation some_op(player: list<gtv>) {
    ...
  }

or

.. code-block:: rell

  record player {
    first_name: text;
    last_name: text;
  }

  operation some_op(player) {
    ...
  }
