
"use strict";


var RosterManagerScreen = function()
{
    this.mSQHandle = null;
    this.mDataSource = new RosterManagerDatasource();

    // generic containers
    this.mContainer = null;
    this.mBackgroundImage = null;
    this.mRosterManagerScreenStatuetes = null;
    this.mRosterManagerScreen = null;
    this.mLeftContentContainer = null;
    this.mRightContentContainer = null;

    // modules
    this.mCharacterPanelModule = null;
    this.mBrothersModule = null;

    this.createModules();
    this.registerDatasourceListener();
};


RosterManagerScreen.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};

RosterManagerScreen.prototype.onConnection = function (_handle)
{
    this.mSQHandle = _handle;
    this.mDataSource.onConnection(this.mSQHandle);

    this.register($('.root-screen'));
};

RosterManagerScreen.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;
    this.mDataSource.onDisconnection();

    // remove from DOM as there is no link to a SQ object
    this.unregister();
};


RosterManagerScreen.prototype.onModuleOnConnectionCalled = function (_module)
{
};

RosterManagerScreen.prototype.onModuleOnDisconnectionCalled = function (_module)
{
};


RosterManagerScreen.prototype.createDIV = function (_parentDiv)
{
    // create: containers (init hidden!)
    this.mContainer = $('<div class="character-screen ui-control dialog-modal-background display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);

    this.mBackgroundImage = this.mContainer.createImage(null, function (_image)
    {
        _image.removeClass('display-none').addClass('display-block');
        _image.fitImageToParent();
    }, function (_image)
    {
        _image.fitImageToParent();
    }, 'display-none');

    this.mRosterManagerScreenStatuetes = $('<div class="character-screen-statuetes"/>');
    this.mContainer.append(this.mRosterManagerScreenStatuetes);

    var parentWidth = this.mContainer.width();
    var parentHeight = this.mContainer.height();
    var width = this.mRosterManagerScreenStatuetes.width();
    var height = this.mRosterManagerScreenStatuetes.height();

    if (width > parentWidth)
    {
        width = width + 32;
        var marginLeft = (parentWidth - width) / 2;

        this.mRosterManagerScreenStatuetes.css({ 'left': marginLeft, 'margin-left': 0, 'margin-right': 0 });
    }

    if (height > parentHeight)
    {
        height = height + 122;
        var marginTop = (parentHeight - height) / 2;

        this.mRosterManagerScreenStatuetes.css({ 'top': marginTop, 'margin-top': 0, 'margin_bottom': 0 });
    }

    this.mRosterManagerScreen = $('<div class="character-screen-container"/>');
    this.mRosterManagerScreenStatuetes.append(this.mRosterManagerScreen);

    this.mLeftContentContainer = $('<div class="l-left-content-container"/>');
    this.mRosterManagerScreen.append(this.mLeftContentContainer);
    this.mRightContentContainer = $('<div class="l-right-content-container"/>');
    this.mRosterManagerScreen.append(this.mRightContentContainer);
};

RosterManagerScreen.prototype.destroyDIV = function ()
{
    this.mRightContentContainer.empty();
    this.mRightContentContainer = null;
    this.mLeftContentContainer.empty();
    this.mLeftContentContainer = null;

    this.mRosterManagerScreen.empty();
    this.mRosterManagerScreen = null;

    this.mBackgroundImage.empty();
    this.mBackgroundImage = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


RosterManagerScreen.prototype.createModules = function()
{
    this.mCharacterPanelModule = new CharacterScreenLeftPanelModule(this, this.mDataSource);
    this.mBrothersModule = new CharacterScreenBrothersListModule(this, this.mDataSource);
};

RosterManagerScreen.prototype.registerModules = function ()
{
    this.mCharacterPanelModule.register(this.mLeftContentContainer);
    this.mBrothersModule.register(this.mRightContentContainer);
};

RosterManagerScreen.prototype.unregisterModules = function ()
{
    this.mCharacterPanelModule.unregister();
    this.mBrothersModule.unregister();
};


RosterManagerScreen.prototype.registerDatasourceListener = function()
{
    this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Inventory.ModeUpdated, jQuery.proxy(this.onInventoryModeUpdated, this));
};


RosterManagerScreen.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.registerModules();
};

RosterManagerScreen.prototype.destroy = function()
{
    this.unregisterModules();
    this.destroyDIV();
};


RosterManagerScreen.prototype.register = function (_parentDiv)
{
    console.log('RosterManagerScreen::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Character Screen. Reason: Screen is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);

        this.notifyBackendOnConnected();
    }
};

RosterManagerScreen.prototype.unregister = function ()
{
    console.log('RosterManagerScreen::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Character Screen. Reason: Screen is not initialized.');
        return;
    }

    this.notifyBackendOnDisconnected();

    this.destroy();
};


RosterManagerScreen.prototype.showBackgroundImage = function ()
{
    // show background image - Only in Battle Preparation mode
    if (this.mDataSource.getInventoryMode() === CharacterScreenDatasourceIdentifier.InventoryMode.BattlePreparation)
    {
        //this.mBackgroundImage.attr('src', ''); // NOTE: Reset img src otherwise Chrome will use the cached one..
        this.mBackgroundImage.attr('src', Path.GFX + Asset.BACKGROUND_INVENTORY);
    }
    else
    {
        this.mBackgroundImage.attr('src', ''); // NOTE: Reset img src otherwise Chrome will use the cached one..
        this.mBackgroundImage.removeClass('display-block').addClass('display-none');
    }
};

RosterManagerScreen.prototype.show = function (_data)
{
    var self = this;

    if (_data !== undefined && _data !== null && typeof(_data) === 'object')
    {
        this.mDataSource.loadFromData(_data);
    }
    else
    {
        this.mDataSource.loadPerkTreesOnce();
        this.mDataSource.loadBrothersList();
        this.mDataSource.loadStashList();
    }

    this.mContainer.velocity("finish", true).velocity({ opacity: 1 },
    {
        duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function()
        {
            $(this).removeClass('display-none').addClass('display-block');
            self.notifyBackendOnAnimating();
            self.showBackgroundImage();
        },
        complete: function()
        {
            self.notifyBackendOnShown();
        }
    });
};

RosterManagerScreen.prototype.hide = function ()
{
    var self = this;

    this.mContainer.velocity("finish", true).velocity({ opacity: 0 },
    {
        duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function()
        {
            self.notifyBackendOnAnimating();
        },
        complete: function()
        {
            $(this).removeClass('display-block').addClass('display-none');
            self.notifyBackendOnHidden();
        }
    });
};


RosterManagerScreen.prototype.onInventoryModeUpdated = function (_dataSource, _inventoryMode)
{
    switch(_inventoryMode)
    {
        case CharacterScreenDatasourceIdentifier.InventoryMode.BattlePreparation:
        {
            this.mRosterManagerScreen.addClass('is-battle-preparation');
        } break;
        case CharacterScreenDatasourceIdentifier.InventoryMode.Stash:
        case CharacterScreenDatasourceIdentifier.InventoryMode.Ground:
        {
            this.mRosterManagerScreen.removeClass('is-battle-preparation');
        } break;
    }
};


RosterManagerScreen.prototype.getModule = function (_name)
{
    switch(_name)
    {
        case 'DataSource': return this.mDataSource;
        default: return null;
    }
};

RosterManagerScreen.prototype.getModules = function ()
{
    return [
        { name: 'DataSource', module: this.mDataSource }
    ];
};


RosterManagerScreen.prototype.notifyBackendOnConnected = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenConnected');
    }
};

RosterManagerScreen.prototype.notifyBackendOnDisconnected = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenDisconnected');
    }
};

RosterManagerScreen.prototype.notifyBackendOnShown = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenShown');
    }
};

RosterManagerScreen.prototype.notifyBackendOnHidden = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenHidden');
    }
};

RosterManagerScreen.prototype.notifyBackendOnAnimating = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenAnimating');
    }
};

registerScreen("RosterManagerScreen", new RosterManagerScreen());
