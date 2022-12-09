/*
// HOOK TIME
var TQUA_onDisconnection = WorldTownScreen.prototype.onDisconnection;
WorldTownScreen.prototype.onDisconnection = function ()
{
    this.mTroopQuarterDialogModule.onDisconnection();
    TQUA_onDisconnection.call(this);
};

var TQUA_onModuleOnConnectionCalled = WorldTownScreen.prototype.onModuleOnConnectionCalled;
WorldTownScreen.prototype.onModuleOnConnectionCalled = function (_module)
{
    if (this.mTroopQuarterDialogModule !== null && this.mTroopQuarterDialogModule.isConnected())
    {
        TQUA_onModuleOnConnectionCalled.call(this);
    }
};

var TQUA_onModuleOnDisconnectionCalled = WorldTownScreen.prototype.onModuleOnDisconnectionCalled;
WorldTownScreen.prototype.onModuleOnDisconnectionCalled = function (_module)
{
    if (this.mTroopQuarterDialogModule !== null && !this.mTroopQuarterDialogModule.isConnected())
    {
        TQUA_onModuleOnDisconnectionCalled.call(this);
    }
};

var TQUA_unregisterModules = WorldTownScreen.prototype.unregisterModules;
WorldTownScreen.prototype.unregisterModules = function ()
{
    this.mTroopQuarterDialogModule.unregister();
    TQUA_unregisterModules.call(this);
};

var TQUA_createModules = WorldTownScreen.prototype.createModules;
WorldTownScreen.prototype.createModules = function()
{
    var self = this;
    TQUA_createModules.call(this);

    if (!('mTroopQuarterDialogModule' in self))
    {
        self.mTroopQuarterDialogModule = null;
        this.mTroopQuarterDialogModule = new TroopQuarterDialogModule(this);
    }
};
TQUA_createModules.call(WorldTownScreen);

var TQUA_registerModules = WorldTownScreen.prototype.registerModules;
TQUA_registerModules.call(WorldTownScreen);
WorldTownScreen.prototype.registerModules = function ()
{
    var self = this;

    if (!('mTroopQuarterDialogModule' in self))
    {
        self.mTroopQuarterDialogModule = null;
        this.mTroopQuarterDialogModule = new TroopQuarterDialogModule(this);
    }

    this.mTroopQuarterDialogModule.register(this.mContainer);
    TQUA_registerModules.call(this);
};

var TQUA_getModule = WorldTownScreen.prototype.getModule;
WorldTownScreen.prototype.getModule = function (_name)
{
    if (_name === 'TroopQuarterModule') {
        return this.mTroopQuarterDialogModule;
    }

    var result = TQUA_getModule.call(this, _name);
    return result;
};

var TQUA_getModules = WorldTownScreen.prototype.getModules;
WorldTownScreen.prototype.getModules = function ()
{
    var result = TQUA_getModules.call(this);
    result.push({name: 'TroopQuarterModule', module: this.mTroopQuarterDialogModule});
    return result;
};

// add new function to show the new module
WorldTownScreen.prototype.showTroopQuarterDialog = function (_data)
{
    var _withSlideAnimation = true;

    this.mContainer.addClass('display-block').removeClass('display-none');

    if (this.mActiveModule != null)
        this.mActiveModule.hide(_withSlideAnimation);
    else
        this.mMainDialogModule.hide();

    this.mActiveModule = this.mTroopQuarterDialogModule;

    if (_data !== undefined && _data !== null && typeof (_data) === 'object')
    {
        //this.loadAssetData(_data.Assets);
        this.mTroopQuarterDialogModule.loadFromData(_data);
    }

    this.mTroopQuarterDialogModule.show(_withSlideAnimation);
};
*/
