====================
Rell Integration
====================

In the bootstrap project, ``rell/src`` directory is configurated to be the rell project's root module. ``rell/src/lib/ft3`` directory contains the FT3 module.

We also provided a ``rell/src/module.rell`` file with some template code which could serve as an entry point for your dapp, although you are free to choose any module structure to your liking.

Defining dapp_account entity
----------------------------

The ``account`` entity provided by ``.lib.ft3.account`` module can be used for account management. But your dapp might need to record more information about the user, like username, email address, etc. We can add an an entity to record those information.

An example dapp's account could be defined as:

.. code-block:: rell

  import acc: .lib.ft3.account;

  entity dapp_account {
    key account: acc.account;
    key first_name: text;
    key last_name: text;
    index age: integer;
  }

In this user model, there is no public key or user ID. Those details are provided by ``acc.account``.

``acc.account`` has an ``id`` property which uniquely identifies an account, and access is controlled by ``acc.account_auth_descriptor`` which include user's public key.

The underlying structure of ``acc.account`` and ``acc.account_auth_descriptor`` is explained in :ref:`ft3-account-management`.

After ``dapp_account`` entity is defined, the next step is to define operation used to create an instance of ``dapp_account``:

.. code-block:: rell

  operation create_dapp_account(
    firstname: text,
    lastname: text;
    age: integer;
    user_auth: acc.auth_descriptor
  ) {
    val account_id = acc.create_account_with_auth(user_auth);
    create dapp_account (
      first_name = firstname,
      last_name = lastname,
      age,
      acc.account @ { account_id }
    );
  }

  query get_dapp_accounts() {
    return dapp_account @? {} ( id = dapp_account.account.id, first_name = .first_name, last_name = .last_name, age = .age);
  }

Restart the node for changes to take effect. Because we have changed database structure, we need to add ``-W`` option to delete the database and add new ``dapp_account`` table:

.. code-block:: text

  postchain/bin/run-node.sh <dapp_name> -W

.. important::
  Make sure to update your client's blockchainRID config with the newly generated blockchainRID

On the client side, operation can be called using ``ft3-lib`` (or ``postchain-client``):

.. code-block:: javascript

  import DirectoryService from './lib/directory-service';
  import { util } from 'postchain-client';
  import { blockchainRID } from '../configs/constants';

  import {
    op,
    Blockchain,
    SingleSignatureAuthDescriptor,
    FlagsType,
    User
  } from 'ft3-lib';

  const keyPair = util.makeKeyPair();
  const user = new User(
    keyPair,
    new SingleSignatureAuthDescriptor(
      keyPair.pubKey,
      [FlagsType.Account, FlagsType.Transfer]
    )
  );

  const blockchain = await Blockchain.initialize(
    blockchainRID,
    new DirectoryService()
  );
  const session = blockchain.newSession(user);

  await session.call(op(
    'create_dapp_account',
    'John',
    'Doe',
    30,
    user.authDescriptor
  ));

We can check if ``create_dapp_account`` operation is executed successfully using ``get_dapp_accounts`` query we created:

.. code-block:: js

  const rest = pcl.restClient.createRestClient(nodeApiUrl, blockchainRID, 5)

  const gtx = pcl.gtxClient.createClient(
    rest,
    Buffer.from(
      blockchainRID,
      'hex'
    ),
    []
  );

  const allDappAccoounts = await gtx.query('get_dapp_accounts');

------------

Modules
-----------------

In this section, we will go through some of the built-in utilities that FT3 modules provide.

It should be noted that the built-in operations and queries all have matching interface in ``ft3-lib`` :doc:`javascript library <./ft3-javascript-library>`.

Account Module
~~~~~~~~~~~~~~~

``import acc: .lib.ft3.account;``

**Functions:**

.. code-block:: rell

  function create_account_with_auth (auth_descriptor): byte_array

Create a new FT3 account using the provided ``ft3.account.auth_descriptor``

- ``auth_descriptor``: The ``auth_descriptor`` used to create this account.

- return: ``account.id`` (equal to ``auth_descriptor.hash()``)

.. code-block:: rell

  function auth_and_log(account_id: byte_array, auth_descriptor_id: byte_array, required_flags: list<text>): account

Authorize given auth_descriptor for required authorization flags, and apply the rate limiter constrains configurated in ``config.template.xml``. This is meant to be the default authorization mechanism for operations.

- ``account_id``: id of the account
- ``auth_descriptor_id``: is equal to ``auth_descriptor.hash()``
- ``required_flags``: list of required authorization flags (see :ref:`ft3-account-management`)
- return: the account instance

.. code-block:: rell

  function require_auth (account, descriptor_id: byte_array, required_flags: list<text>)

Authorize given auth_descriptor, but does not apply rate limiter's constrains.

.. code-block:: rell

  function _add_auth_descriptor (account, auth_descriptor)
  function _delete_auth_descriptor(auth_descriptor: account_auth_descriptor)
  function _delete_all_auth_descriptors_exclude(account, auth_descriptor_id: byte_array)

Utilities for managing auth_descriptors.

**Operations:**

.. code-block:: rell

  operation delete_auth_descriptor (account_id: byte_array, auth_descriptor_id: byte_array, delete_descriptor_id: byte_array)

  operation delete_all_auth_descriptors_exclude(account_id: byte_array, auth_descriptor_id: byte_array)

  operation add_auth_descriptor (account_id: byte_array, auth_id: byte_array, new_desc: acc.auth_descriptor)

**Queries:**

.. code-block:: rell

  query get_account_auth_descriptors(id: byte_array)

  query get_account_by_id(id: byte_array)

  query get_account_by_auth_descriptor(auth_descriptor)

  query get_accounts_by_participant_id(id: byte_array)

  query get_accounts_by_auth_descriptor_id(descriptor_id: byte_array)

Core Module
~~~~~~~~~~~
``import core: .lib.ft3.core;``

**Functions:**

.. code-block:: rell

  function register_asset (name, issuing_chain_rid: byte_array): asset

Register a new asset on the chain.

.. code-block:: rell

  function _get_asset_balances(account_id: byte_array): list<(id:byte_array,name:text,amount:integer,chain_id:byte_array)>

Get asset balance of an account.

.. code-block:: rell

  function ensure_balance(acc.account, asset): balance

Get account's balance of an asset, or create one if it doesn't exist.

.. code-block:: rell

  struct xfer_input {
    account_id: byte_array;
    asset_id: byte_array;
    auth_descriptor_id: byte_array;
    amount: integer;
    extra: map<text, gtv>;
  }

  struct xfer_output {
    account_id: byte_array;
    asset_id: byte_array;
    amount: integer;
    extra: map<text, gtv>;
  }

  function _transfer (inputs: list<xfer_input>, outputs: list<xfer_output>)

Perform an asset transfer from accounts described in ``xfer_input`` to accounts in ``xfer_output``.

If ``xfer_output.extra`` map contains a ``reg_auth_desc`` key, then the value will be used as ``auth_descriptor`` to create a new account (meaning you can create a new account then transfer asset to it immediately in one transaction).

Using the transaction function in Rell could look something like this:

.. code-block:: rell

   function transfer_balance(from: user_account,    //user_account being an entity with an acc.account attribute.  
                             from_auth: acc.auth_descriptor
                             to: user_account, to_auth: acc.auth_descriptor,
                             amount:integer){
       val input = ft3.xfer_input(account_id = from.account.id
                                  asset_id = exampleToken.token.id,
                                  auth_descriptor_id = from_auth,
                                  amount = amount,
                                  extra = map<text, gtv>()
                                  );
       val output = ft3.xfer_input(account_id = to.account.id,
                                   asset_id = exampleToken.token.id,
                                   auth_descriptor_id = to_auth,
                                   amount = amount,
                                   extra = map<text, gtv>()
                               	);
        val inputs = list<ft3.xfer_input>();
        inputs.add(input);
        outputs.add(output);
        ft3._transfer(inputs, outputs);
   }

**Operations:**

.. code-block:: rell

  operation transfer (inputs: list<ft3.xfer_input>, outputs: list<ft3.xfer_output>)

**Queries:**

.. code-block:: rell

  query get_asset_balances(account_id: byte_array)

  query get_asset_balance(account_id: byte_array, asset_id: byte_array)

  query get_asset_by_name(name)

  query get_asset_by_id(asset_id: byte_array)

  query get_all_assets()

  query get_payment_history(account_id: byte_array, after_block: integer)
