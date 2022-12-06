/*
*  @Project:		Battle Brothers
*	@Company:		Overhype Studios
*
*	@Copyright:		(c) Overhype Studios | 2013 - 2020
*
*  @Author:		Overhype Studios
*  @Date:			26.01.2017 / Reworked: 26.11.2017
*  @Description:	Character Right Panel Header Module JS
*/
"use strict";

var RosterManagerHeaderModule = function(_parent, _dataSource)
{
    this.mParent = _parent;
    this.mDataSource = _dataSource;

    this.mContainer = null;

    this.mCloseButton = null;

    this.registerDatasourceListener();
};


RosterManagerHeaderModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: container
    this.mContainer = $('<div class="right-panel-header-module"/>');
    _parentDiv.append(this.mContainer);

    var leftButtonContainer = $('<div class="buttons-container is-left"/>');
    this.mContainer.append(leftButtonContainer);

    var rightButtonContainer = $('<div class="buttons-container is-right"/>');
    this.mContainer.append(rightButtonContainer);

    layout = $('<div class="l-button is-close"/>');
    rightButtonContainer.append(layout);
    this.mCloseButton = layout.createImageButton(Path.GFX + Asset.BUTTON_QUIT, function ()
    {
        self.mDataSource.notifyBackendCloseButtonClicked();
    }, '', 6);
};

RosterManagerHeaderModule.prototype.destroyDIV = function ()
{
    this.mCloseButton.remove();
    this.mCloseButton = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};

RosterManagerHeaderModule.prototype.registerDatasourceListener = function()
{
};

RosterManagerHeaderModule.prototype.bindTooltips = function ()
{
    this.mCloseButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.RightPanelHeaderModule.CloseButton });
};

RosterManagerHeaderModule.prototype.unbindTooltips = function ()
{
    this.mCloseButton.unbindTooltip();
};

RosterManagerHeaderModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};

RosterManagerHeaderModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};


RosterManagerHeaderModule.prototype.register = function (_parentDiv)
{
    console.log('RosterManagerHeaderModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Right Panel Header Module. Reason: Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};

RosterManagerHeaderModule.prototype.unregister = function ()
{
    console.log('RosterManagerHeaderModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Right Panel Header Module. Reason: Module is not initialized.');
        return;
    }

    this.destroy();
};

RosterManagerHeaderModule.prototype.isRegistered = function ()
{
    if (this.mContainer !== null)
    {
        return this.mContainer.parent().length !== 0;
    }

    return false;
};
