/*
 *  @Project:		Battle Brothers
 *	@Company:		Overhype Studios
 *
 *	@Copyright:		(c) Overhype Studios | 2013 - 2020
 *
 *  @Author:		Overhype Studios
 *  @Date:			24.05.2017 / Reworked: 26.11.2017
 *  @Description:	Left Panel Header Module JS
 */
"use strict";

/* TODO:
    + Progressbar gegen Komponente austauschen
    + Image auch mit Offsets positionieren?
 */

CharacterScreenLeftPanelHeaderModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

	// create: header container
	this.mContainer = $('<div class="left-panel-header-module"/>');
    _parentDiv.append(this.mContainer);

	// create: portrait
	var portraitContainer = $('<div class="portrait-container"/>');
	this.mContainer.append(portraitContainer);
	this.mPortraitContainer = $('<div class="l-portrait-image-container"/>');
	portraitContainer.append(this.mPortraitContainer);

	this.mPortraitPlaceholder = this.mPortraitContainer.createImage('', function (_image)
	{
		self.mPortraitPlaceholder.centerImageWithinParent(0, 0, 1.0, false);
	}, null, 'opacity-almost-none');

	this.mPortraitImage = this.mPortraitContainer.createImage('', function (_image)
	{
		self.mPortraitImage.centerImageWithinParent(0, 0, 1.0, false);
		self.mPortraitImage.removeClass('opacity-almost-none');
		self.mPortraitPlaceholder.addClass('opacity-almost-none');
		self.mPortraitPlaceholder.attr('src', self.mPortraitImage.attr('src'));
	}, null, '');

    this.mNameContainer = $('<div class="name-container"/>');
    this.mContainer.append(this.mNameContainer);

    var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
    this.mNameContainer.append(nameLabel);
    this.mNameContainer.click(function ()
    {
        if ($(this).hasClass('is-clickable') === false)
        {
            return false;
        }

        self.mDataSource.notifyBackendPopupDialogIsVisible(true);
        self.mCurrentPopupDialog = $('.character-screen').createPopupDialog('Change Name & Title', null, null, 'change-name-and-title-popup');

        self.mCurrentPopupDialog.addPopupDialogOkButton(function (_dialog)
        {
            self.updateNameAndTitle(_dialog);
            self.mCurrentPopupDialog = null;
            _dialog.destroyPopupDialog();
            self.mDataSource.notifyBackendPopupDialogIsVisible(false);
        });

        self.mCurrentPopupDialog.addPopupDialogCancelButton(function (_dialog)
        {
            self.mCurrentPopupDialog = null;
            _dialog.destroyPopupDialog();
            self.mDataSource.notifyBackendPopupDialogIsVisible(false);
        });

        self.mCurrentPopupDialog.addPopupDialogContent(self.createChangeNameAndTitleDialogContent(self.mCurrentPopupDialog));

		// focus!
		var inputFields = self.mCurrentPopupDialog.findPopupDialogContentContainer().find('input');
		$(inputFields[0]).focus();
    });

	this.mLevelContainer = $('<div class="level-container"/>');
	this.mContainer.append(this.mLevelContainer);

    var levelupLabel = $('<div class="label text-font-normal font-bold font-bottom-shadow font-color-value"/>');
    this.mLevelContainer.append(levelupLabel);
/*
    var levelupImage = $('<img class="display-none"/>');
    levelupImage.attr('src', Path.GFX + Asset.ICON_LEVELED_UP);
    this.mLevelContainer.append(levelupImage);
 */
	var xpContainer = $('<div class="xp-container"/>');
	this.mContainer.append(xpContainer);
    var xpCenterContainer = $('<div class="l-xp-center-container"/>');
	xpContainer.append(xpCenterContainer);
	this.mXPProgressbar = xpCenterContainer.createProgressbar(true, 'xp has-frame-xp');
};

CharacterScreenLeftPanelHeaderModule.prototype.destroyDIV = function ()
{
    if(this.mCurrentPopupDialog !== null)
    {
		this.mCurrentPopupDialog.destroyPopupDialog();
		this.mCurrentPopupDialog = null;
	}

    this.mPortraitContainer.empty();
    this.mPortraitContainer.remove();
    this.mPortraitContainer = null;

    this.mNameContainer.empty();
    this.mNameContainer.remove();
    this.mNameContainer = null;

    this.mLevelContainer.empty();
    this.mLevelContainer.remove();
    this.mLevelContainer = null;

    this.mXPProgressbar.empty();
    this.mXPProgressbar.remove();
    this.mXPProgressbar = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


CharacterScreenLeftPanelHeaderModule.prototype.createChangeNameAndTitleDialogContent = function (_dialog)
{
    var data = this.mDataSource.getSelectedBrother();
    var selectedBrother = CharacterScreenIdentifier.Entity.Character.Key in data ? data[CharacterScreenIdentifier.Entity.Character.Key] : null;
    if (selectedBrother === null)
    {
        console.error('Failed to create dialog content. Reason: No brother selected.');
        return null;
    }

    var result = $('<div class="change-name-and-title-container"/>');

    // create & set name
    var row = $('<div class="row"/>');
    result.append(row);
    var label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Name</div>');
    row.append(label);

	var self = this;

    var inputLayout = $('<div class="l-input"/>');
    row.append(inputLayout);
    var inputField = inputLayout.createInput('', 0, Constants.Game.MAX_BROTHER_NAME_LENGTH, 1, function (_input)
	{
        _dialog.findPopupDialogOkButton().enableButton(_input.getInputTextLength() >= Constants.Game.MIN_BROTHER_NAME_LENGTH);
    }, 'title-font-big font-bold font-color-brother-name', function (_input)
	{
		var button = _dialog.findPopupDialogOkButton();
		if(button.isEnabled())
		{
			button.click();
		}
	});

    if(CharacterScreenIdentifier.Entity.Character.Name in selectedBrother)
        inputField.setInputText(selectedBrother[CharacterScreenIdentifier.Entity.Character.Name]);

    // create & set title
    row = $('<div class="row"/>');
    result.append(row);
    label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Title</div>');
    row.append(label);

    inputLayout = $('<div class="l-input"/>');
    row.append(inputLayout);
    inputField = inputLayout.createInput('', Constants.Game.MIN_BROTHER_TITLE_LENGTH, Constants.Game.MAX_BROTHER_TITLE_LENGTH, 2, null, 'title-font-big font-bold font-color-brother-name', function (_input)
	{
		var button = _dialog.findPopupDialogOkButton();
		if(button.isEnabled())
			button.click();
	});

	if(CharacterScreenIdentifier.Entity.Character.Title in selectedBrother)
        inputField.setInputText(selectedBrother[CharacterScreenIdentifier.Entity.Character.Title]);

    return result;
};

CharacterScreenLeftPanelHeaderModule.prototype.updateNameAndTitle = function (_dialog)
{
    var contentContainer = _dialog.findPopupDialogContentContainer();
    var inputFields = contentContainer.find('input');

    this.mDataSource.updateNameAndTitle(null, $(inputFields[0]).getInputText(), $(inputFields[1]).getInputText());
};


CharacterScreenLeftPanelHeaderModule.prototype.createLevelUpDialogSubHeader = function ()
{
    var result = $('<div class="levelup-header"/>');
    var centerLayout  = $('<div class="l-center-container"/>');
    result.append(centerLayout);
/*
    var image = $('<img/>');
    image.attr('src', Path.GFX + Asset.ICON_LEVELED_UP);
    centerLayout.append(image);
 */
    var label = $('<div class="label text-font-normal font-bold font-bottom-shadow font-color-value"/>');
    centerLayout.append(label);
    label.html('' + Constants.Game.MAX_STATS_INCREASE_COUNT + ' / ' + Constants.Game.MAX_STATS_INCREASE_COUNT);
    label.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LevelUpPopupDialog.StatIncreasePoints });

    return result;
};

CharacterScreenLeftPanelHeaderModule.prototype.destroyLevelUpDialogContentRow = function (_definitions)
{
    $.each(_definitions, function(_key, _value)
	{
        _value.Button.empty();
        _value.Button.remove();
        _value.Button = null;

        _value.Progressbar.empty();
        _value.Progressbar.remove();
        _value.Progressbar = null;
    });
};

CharacterScreenLeftPanelHeaderModule.prototype.setLevelUpDialogContentProgressbarValue = function (_progressbarDiv, _data, _valueKey, _valueMaxKey)
{
    if (_valueKey in _data && _data[_valueKey] !== null && _valueMaxKey in _data && _data[_valueMaxKey] !== null)
    {
        _progressbarDiv.changeProgressbarNormalWidth(_data[_valueKey], _data[_valueMaxKey], true);
        _progressbarDiv.changeProgressbarLabel('' + _data[_valueKey]);
    }
};

CharacterScreenLeftPanelHeaderModule.prototype.disableLevelUpButtons = function (_definitions)
{
    $.each(_definitions, function(_key, _value)
	{
        _value.Button.enableButton(false);

		if(!_value.Button.data('isIncreased'))
			_value.Button.changeButtonText('');
    });
};

CharacterScreenLeftPanelHeaderModule.prototype.setLevelUpDialogToFinish = function ()
{
    this.disableLevelUpButtons(this.mLevelUpLeftStatsRows);
    this.disableLevelUpButtons(this.mLevelUpRightStatsRows);
    this.mCurrentPopupDialog.findPopupDialogOkButton().enableButton(true);
};

CharacterScreenLeftPanelHeaderModule.prototype.bindTooltips = function ()
{
    if(this.mDataSource.isTacticalMode() !== true)
    {
        this.mNameContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.ChangeNameAndTitle });
    }

    this.mXPProgressbar.bindProgressbarTooltip(TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.Experience);
    this.mLevelContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.Level });
};

CharacterScreenLeftPanelHeaderModule.prototype.unbindTooltips = function ()
{
    if(this.mDataSource.isTacticalMode() !== true)
    {
        this.mNameContainer.unbindTooltip();
    }

    this.mXPProgressbar.bindProgressbarTooltip();
    this.mLevelContainer.unbindTooltip();
};


CharacterScreenLeftPanelHeaderModule.prototype.registerDatasourceListener = function()
{
	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Updated, jQuery.proxy(this.onBrotherUpdated, this));
	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Selected, jQuery.proxy(this.onBrotherSelected, this));
};


CharacterScreenLeftPanelHeaderModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};

CharacterScreenLeftPanelHeaderModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};


CharacterScreenLeftPanelHeaderModule.prototype.register = function (_parentDiv)
{
    console.log('CharacterScreenLeftPanelHeaderModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Left Panel Header Module. Reason: Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};

CharacterScreenLeftPanelHeaderModule.prototype.unregister = function ()
{
    console.log('CharacterScreenLeftPanelHeaderModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Left Panel Header Module. Reason: Module is not initialized.');
        return;
    }

    this.destroy();
};

CharacterScreenLeftPanelHeaderModule.prototype.isRegistered = function ()
{
	if (this.mContainer !== null)
	{
		return this.mContainer.parent().length !== 0;
	}

	return false;
};


CharacterScreenLeftPanelHeaderModule.prototype.setPortraitImage = function(_imagePath)
{
	if (this.mPortraitImage.attr('src') == Path.PROCEDURAL + _imagePath)
		return;

	this.mPortraitPlaceholder.removeClass('opacity-almost-none');
	this.mPortraitImage.attr('src', Path.PROCEDURAL + _imagePath);
};

CharacterScreenLeftPanelHeaderModule.prototype.setNameAndTitle = function(_name, _title)
{
	var label = this.mNameContainer.find('.label:first');
    if (label.length > 0)
    {
        if (_title !== null && typeof(_title) === 'string' && _title.length > 0)
        {
            label.html(_name + '<br/>' + _title);
        }
        else
        {
            label.html(_name);
        }
    }

    /*var image = this.mNameContainer.find('img:first');
    if (image.length > 0)
    {*/
        if (this.mDataSource.isTacticalMode() !== true)
        {
            this.mNameContainer.addClass('is-clickable');
            //image.removeClass('display-none').addClass('display-block');
        }
        else
        {
            this.mNameContainer.removeClass('is-clickable');
            //image.removeClass('display-block').addClass('display-none');
        }
   // }
};

CharacterScreenLeftPanelHeaderModule.prototype.setLevel = function(_levelValue, _hasLevelUp)
{
    var label = this.mLevelContainer.find('.label:first');
    if (label.length > 0)
    {
        label.html('' + _levelValue);
    }

    var image = this.mLevelContainer.find('img:first');
    if (image.length > 0)
    {
        if (this.mDataSource.isTacticalMode() !== true && _hasLevelUp === true)
        {
            this.mLevelContainer.addClass('is-clickable');
            this.mXPProgressbar.addClass('is-clickable');
            image.removeClass('display-none').addClass('display-block');
            //this.mLevelContainer.blinkColorIndefinitely();

        }
        else
        {
            this.mLevelContainer.stop();
            this.mLevelContainer.removeClass('is-clickable');
            this.mXPProgressbar.removeClass('is-clickable');
            image.removeClass('display-block').addClass('display-none');
        }
    }
    /*else
    {
        this.mLevelContainer.stop();
    }*/
};

CharacterScreenLeftPanelHeaderModule.prototype.setXP = function(_xpValue, _xpValueMax, _level, _hasLevelUp)
{
	if(_level >= 11)
	{
		this.mXPProgressbar.addClass('xp-paragon');
	}
	else
	{
		this.mXPProgressbar.removeClass('xp-paragon');
	}

    this.mXPProgressbar.changeProgressbarNormalWidth(_xpValue, _xpValueMax);
    this.mXPProgressbar.changeProgressbarLabel('' + _xpValue + ' / ' + _xpValueMax);
};


CharacterScreenLeftPanelHeaderModule.prototype.updateControls = function(_data)
{
    /*this.mLevelContainer.css('backgroundColor', 'transparent');
    this.mLevelContainer.stop();*/

	if (_data === null || typeof(_data) !== 'object')
	{
		return;
	}

	// update image
	if (CharacterScreenIdentifier.Entity.Character.ImagePath in _data)
	{
		this.setPortraitImage(_data[CharacterScreenIdentifier.Entity.Character.ImagePath]);
	}

	// update name & title
	if (CharacterScreenIdentifier.Entity.Character.Name in _data)
	{
		var titel = '';
		if (CharacterScreenIdentifier.Entity.Character.Title in _data)
		{
			titel = _data[CharacterScreenIdentifier.Entity.Character.Title];
		}
		this.setNameAndTitle(_data[CharacterScreenIdentifier.Entity.Character.Name], titel);
	}

    // update level
	if (CharacterScreenIdentifier.Entity.Character.Level in _data)
	{
	    this.setLevel(_data[CharacterScreenIdentifier.Entity.Character.Level], _data[CharacterScreenIdentifier.Entity.Character.LevelUp.Key] !== null);
	}

	// update xp
	if (CharacterScreenIdentifier.Entity.Character.XPValue in _data && CharacterScreenIdentifier.Entity.Character.XPValueMax in _data)
	{
		this.setXP(_data[CharacterScreenIdentifier.Entity.Character.XPValue], _data[CharacterScreenIdentifier.Entity.Character.XPValueMax], _data[CharacterScreenIdentifier.Entity.Character.Level], _data[CharacterScreenIdentifier.Entity.Character.LevelUp.Key] !== null);
	}
};


CharacterScreenLeftPanelHeaderModule.prototype.onBrotherUpdated = function (_dataSource, _brother)
{
    /*this.mLevelContainer.css('backgroundColor', 'transparent');
    this.mLevelContainer.stop();*/

	if (this.mDataSource.isSelectedBrother(_brother) && CharacterScreenIdentifier.Entity.Character.Key in _brother)
	{
		this.updateControls(_brother[CharacterScreenIdentifier.Entity.Character.Key]);
	}
};

CharacterScreenLeftPanelHeaderModule.prototype.onBrotherSelected = function (_dataSource, _brother)
{
    /*this.mLevelContainer.css('backgroundColor', 'transparent');
    this.mLevelContainer.stop();*/

	if (_brother !== null && (CharacterScreenIdentifier.Entity.Id in _brother && CharacterScreenIdentifier.Entity.Character.Key in _brother))
	{
		this.updateControls(_brother[CharacterScreenIdentifier.Entity.Character.Key]);
	}
};
