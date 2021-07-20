==============================
Converting Chromia-Chat to FT3
==============================

In this section, we will "upgrade" the :doc:`Chromia Chat Example Project </examples/chromachat>` into a version that uses FT3.


First of all, lets change the user entity to be identified by an account instead of a public key.

.. code-block:: rell

   entity user{
        key account : lf.ft3.acc.account;
        key name : text;
   }

Our functions in Rell will no longer have a pubkey as the identifier of users, instead we will pass
the account of users as parameters when writing functions. Instead of checking signers in the function, we
will also use auth_log to make sure the right account is using the function:

.. code-block:: rell

   operation init(founder_auth: acc.auth_descriptor){
        require( (user@*{} limit 1).size() == 0);
        val account_id = acc.create_account_with_auth(founder_auth);
        val founder = create user (account_id, "admin");
        create balance (founder, 100000);
        }
        

.. code-block:: rell

   operation add_channel_member(
             admin_auth: acc.auth_descriptor,
             channel_name: name,member_username: text
              ){
       auth_and_log(get_account_by_auth_descriptor(admin_auth),
                    admin_auth.hash(), [flagType.Account, flagType.Transaction]
                    );
       val admin_usr = user@{admin_account};
       pay_fee(admin_usr, 1);
       val channel = channel@{channel_name, .admin==user@{admin_account}};
       create channel_member (channel, member=user@{.username == member_username});
       }


=====================
Client Side
=====================

In our client side we will import the required ft3 dependencies and our constants

.. code-block:: javascript

        const pcl = require('postchain-client')
        const crypto = require('crypto')
        import { Postchain } from 'ft3-lib';
        import { blockchainRID, blockchainUrl } from './configs/constants'; // these configs are set in previous section
        import {
        op,
        Blockchain,
        SingleSignatureAuthDescriptor,
        FlagsType,
        User
        } from 'ft3-lib';



And also initialize the blockchain:

.. code-block:: javascript

        const blockchain = await Blockchain.initialize(
        blockchainRID,
        new DirectoryService()
        );



For our Javascript frontend, the init function will take the admins auth descriptor as an argument.
For this we will make a new single signature auth descriptor and admin user

.. code-block:: javascript

        const adminKeyPair = util.makeKeyPair();
        const admin = new User(
                adminKeyPair,
                new SingleSignatureAuthDescriptor(
                        adminKeyPair.pubKey,
                        [FlagsType.Account, FlagsType.Transfer]
                        )
                );



And then we start a new session on the blockchain with admin

.. code-block:: javascript

        const session = blockchain.newSession(admin);


On the session we will call on the Rell init operation
.. code-block:: javascript

        await session.call(op('init', admin.authDescriptor));

For our functions like create channel we will use the same method of using session.call for communication with our Rell backend

.. code-block:: javascript

   async function registerUser(existing_user, new_user_keyPair, new_user_name, fee){
        const auth_descriptor = new SingleSignatureAuthDescriptor(
                new_user_keyPair.pubKey,
                [FlagsType.Account, FlagsType.Transfer]
                );
        const user = new User(authDescriptor, new_user_keyPair);
        const session = blockchain.newSession(existing_user);
        await session.call(op('register_user', existing_user, user.authDescriptor, new_user_name, fee);
   } 







