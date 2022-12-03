"use strict";

// identifier for roster tag
var ModRosterOwner =
{
    Stronghold: 'roster.stronghold',
    Player: 'roster.player'
};

// identifier for the fancy scroll-like shenanigans
var ToggleScroll = 
{
    Max   : 3,
    Min   : 1,
    Type  : 
    {
        Stats    : 1,
        Skills   : 2,
        Portrait : 3,
    },
    Order : 
    {
        Ascending  :  1,
        Descending : -1,
    },
};

var StrongholdPokebroPcDialogModule = function(_parent)
{
    this.mSQHandle        = null;
    this.mParent          = _parent;

    // assets labels
    this.mAssets = new WorldTownScreenAssets(_parent);
    this.mRoster = //for assets things
    {
        Brothers              : 0,
        BrothersMax           : 0,
        StrongholdBrothers    : 0,
        StrongholdBrothersMax : 0,
    }

    // event listener
    this.mEventListener   = null;

    // generic containers
    this.mContainer       = null;
    this.mDialogContainer = null;

    // current popup dialog
    this.mCurrentPopupDialog = null;

    // for perk tree popup
    this.mPerkTree = null;
    this.mPerkRows = null;

    // stuffs
    this.mPayDismissalWage      = false;
    this.mSimpleRosterTooltip   = false;
    this.mPlayerRosterLimit     = 0;
    this.mStrongholdRosterLimit = 0;
    this.mSelectedBrother = 
    {
        Index : 0,
        Tag   : null
    };

    // some shenanigans
    this.mToggledType                  = ToggleScroll.Type.Stats;
    this.mToggledOrder                 = ToggleScroll.Order.Ascending;
    this.mDetailsContainer             = null;
    this.mScrollBackgroundContainer    = null;
    this.mDetailsScrollHeaderContainer = null;
    this.mTitleContainer               = null;

    // button bar
    this.mButtonBarContainer           = null;
    this.mStripAllButton               = null;
    this.mStripWeaponButton            = null;
    this.mStripArmorButton             = null;
    this.mStripBagButton               = null;
    this.mRenameButton                 = null;
    this.mDismissButton                = null;
    this.mTooltipButton                = null;
    this.mPlayerBrotherButton          = null;

    // stronghold
    this.mStronghold = 
    {
        Slots               : null,
        NumActive           : 0,
        NumActiveMax        : 33,
        NumActiveMin        : 0,
        BrothersList        : null,
        ListContainer       : null,
        ListScrollContainer : null,
    };

    // player
    this.mPlayer = 
    {
        Slots               : null,
        NumActive           : 0,
        NumActiveMax        : 27,
        NumActiveMin        : 1,
        BrothersList        : null,
        ListContainer       : null,
        ListScrollContainer : null,
    };

    // skills panel
    this.mSkills = 
    {
        Container           : null,
        ListContainer       : null,
        ListScrollContainer : null,
        ActiveSkillsRow     : null,
        PassiveSkillsRow    : null,
        StatusEffectsRow    : null,
    };

    // portrait panel
    this.mPortrait = 
    {
        Container     : null,
        Image         : null,
        Placeholder   : null,
        NameLabel     : null,
    };

    // stats panel
    this.mStatsContainer  = null;
    this.mStatsRows = {
        Hitpoints: {
            IconPath: Path.GFX + Asset.ICON_HEALTH,
            StyleName: ProgressbarStyleIdentifier.Hitpoints,
            TooltipId: TooltipIdentifier.CharacterStats.Hitpoints,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        Fatigue: {
            IconPath: Path.GFX + Asset.ICON_FATIGUE,
            StyleName: ProgressbarStyleIdentifier.Fatigue,
            TooltipId: TooltipIdentifier.CharacterStats.Fatigue,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        Bravery: {
            IconPath: Path.GFX + Asset.ICON_BRAVERY,
            StyleName: ProgressbarStyleIdentifier.Bravery,
            TooltipId: TooltipIdentifier.CharacterStats.Bravery,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        Initiative: {
            IconPath: Path.GFX + Asset.ICON_INITIATIVE,
            StyleName: ProgressbarStyleIdentifier.Initiative,
            TooltipId: TooltipIdentifier.CharacterStats.Initiative,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        MeleeSkill: {
            IconPath: Path.GFX + Asset.ICON_MELEE_SKILL,
            StyleName: ProgressbarStyleIdentifier.MeleeSkill,
            TooltipId: TooltipIdentifier.CharacterStats.MeleeSkill,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        RangeSkill: {
            IconPath: Path.GFX + Asset.ICON_RANGE_SKILL,
            StyleName: ProgressbarStyleIdentifier.RangeSkill,
            TooltipId: TooltipIdentifier.CharacterStats.RangeSkill,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        MeleeDefense: {
            IconPath: Path.GFX + Asset.ICON_MELEE_DEFENCE,
            StyleName: ProgressbarStyleIdentifier.MeleeDefense,
            TooltipId: TooltipIdentifier.CharacterStats.MeleeDefense,
            Row: null,
            Progressbar: null,
            Talent: null
        },
        RangeDefense: {
            IconPath: Path.GFX + Asset.ICON_RANGE_DEFENCE,
            StyleName: ProgressbarStyleIdentifier.RangeDefense,
            TooltipId: TooltipIdentifier.CharacterStats.RangeDefense,
            Row: null,
            Progressbar: null,
            Talent: null
        },
    }; 

    // buttons
    this.mLeaveButton     = null;

    // generics
    this.mIsVisible       = false;
};


StrongholdPokebroPcDialogModule.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};

StrongholdPokebroPcDialogModule.prototype.onConnection = function (_handle)
{
    //if (typeof(_handle) == 'string')
    {
        this.mSQHandle = _handle;

        // notify listener
        if (this.mEventListener !== null && ('onModuleOnConnectionCalled' in this.mEventListener))
        {
            this.mEventListener.onModuleOnConnectionCalled(this);
        }
    }
};

StrongholdPokebroPcDialogModule.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnDisconnectionCalled(this);
    }
};

StrongholdPokebroPcDialogModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers (init hidden!)
    this.mContainer = $('<div class="l-stronghold-pokebro-pc-dialog-container display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);
    this.mDialogContainer = this.mContainer.createDialog('', '', '', true, 'dialog-1280-768');

    // create tabs
    var tabButtonsContainer = $('<div class="l-tab-container"/>');
    this.mDialogContainer.findDialogTabContainer().append(tabButtonsContainer);
        
    // create assets
    this.mAssets.createDIV(tabButtonsContainer);

    // hide all unnecessary assets
    this.mAssets.mMoneyAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mFoodAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mAmmoAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mSuppliesAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mMedicineAsset.removeClass('display-block').addClass('display-none');

    // give this the stronghold icon, i'll change this button so it will display roster num of stronghold
    this.mAssets.mBrothersAsset.changeButtonImage(Path.GFX + 'ui/icons/stronghold_icon.png');


    // create content
    var content = this.mDialogContainer.findDialogContentContainer();
    var column = $('<div class="right-column"/>');
    content.append(column);



    //-1 top row
    var row = $('<div class="top-row"/>');
    column.append(row);

    // stronghold roster
    var listContainerLayout = $('<div class="l-list-container"/>');
    row.append(listContainerLayout);
    // the normal way to create the list fails me, so i make a cusom function so i can add the option i want easily
    this.mStronghold.ListContainer = listContainerLayout.createListWithCustomOption({
        delta: 1.24,
        lineDelay: 0,
        lineTimer: 0,
        pageDelay: 0,
        pageTimer: 0,
        bindKeyboard: false,
        smoothScroll: false,
        resizable: false, // to hide the horizontal scroll
        horizontalBar: 'none', // to hide the horizontal scroll
    });
    this.mStronghold.ListScrollContainer = this.mStronghold.ListContainer.findListScrollContainer();
    this.createBrotherSlots(this.mStronghold, ModRosterOwner.Stronghold);



    //-2 mid row
    var row = $('<div class="middle-row"/>');
    column.append(row);

    // scroll shenanigans
    this.mDetailsScrollHeaderContainer = $('<div class="is-left"/>');
    row.append(this.mDetailsScrollHeaderContainer);
    this.mDetailsScrollHeaderContainer.click(function()
    {
        self.toggleScrollShenanigan(true);
    });
    var titleContainer = $('<div class="title-container"/>');
    this.mDetailsScrollHeaderContainer.append(titleContainer);
    this.mTitleContainer = $('<div class="title title-font-normal font-bold font-color-ink"/>');
    titleContainer.append(this.mTitleContainer);
    this.mTitleContainer.html('Stats');

    // buttons bar
    this.mButtonBarContainer = $('<div class="is-right"/>');
    row.append(this.mButtonBarContainer);
    var panelLayout = $('<div class="button-panel"/>');
    this.mButtonBarContainer.append(panelLayout);

    // button 1 - to strip naked a bro
    var layout = $('<div class="l-button is-stripping-all"/>');
    panelLayout.append(layout);
    this.mStripAllButton = layout.createImageButton(Path.GFX + 'ui/buttons/filter_all.png', function ()
    {
        self.transferItemsToStash('all');
    }, '', 3);
    this.mStripAllButton.bindTooltip({ contentType: 'ui-element', elementId: 'pokebro.strippingnaked' });

    // button 2 - to strip arms
    var layout = $('<div class="l-button is-stripping-weapon"/>');
    panelLayout.append(layout);
    this.mStripWeaponButton = layout.createImageButton(Path.GFX + 'ui/icons/item_weapon.png', function ()
    {
        self.transferItemsToStash('weapon');
    }, '', 3);
    this.mStripWeaponButton.bindTooltip({ contentType: 'ui-element', elementId: 'pokebro.strippingweapon' });

    // button 3 - to strip cloth only
    var layout = $('<div class="l-button is-stripping-armor"/>');
    panelLayout.append(layout);
    this.mStripArmorButton = layout.createImageButton(Path.GFX + 'ui/icons/armor_body.png', function ()
    {
        self.transferItemsToStash('armor');
    }, '', 3);
    this.mStripArmorButton.bindTooltip({ contentType: 'ui-element', elementId: 'pokebro.strippingarmor' });

    // button 4 - to steal all stuffs in bag
    var layout = $('<div class="l-button is-stripping-bag"/>');
    panelLayout.append(layout);
    this.mStripBagButton = layout.createImageButton(Path.GFX + 'ui/icons/bag.png', function ()
    {
        self.transferItemsToStash('bag');
    }, '', 3);
    this.mStripBagButton.bindTooltip({ contentType: 'ui-element', elementId: 'pokebro.strippingbag' });

    // button 5 - to rename bro
    var layout = $('<div class="l-button is-rename"/>');
    panelLayout.append(layout);
    this.mRenameButton = layout.createImageButton(Path.GFX + 'ui/icons/papers.png', function ()
    {
        self.openRenamePopupDialog(null);
    }, '', 3);
    this.mRenameButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.ChangeNameAndTitle });

    // button 6 - to dismis bro
    var layout = $('<div class="l-button is-dismiss"/>');
    panelLayout.append(layout);
    this.mDismissButton = layout.createImageButton(Path.GFX + Asset.BUTTON_DISMISS_CHARACTER, function ()
    {
        self.openDismissPopupDialog(null);
    }, '', 3);
    this.mDismissButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.Dismiss });

    var layout = $('<div class="l-button is-roster-tooltip"/>');
    panelLayout.append(layout);
    this.mTooltipButton = layout.createImageButton(Path.GFX + 'ui/icons/scroll_02.png', function ()
    {
        self.mSimpleRosterTooltip = !self.mSimpleRosterTooltip;
        self.notifyBackendTooltipButtonPressed(self.mSimpleRosterTooltip);
        if(self.mSimpleRosterTooltip === false)
            self.mTooltipButton.changeButtonImage(Path.GFX + 'ui/icons/scroll_02.png');
        else
            self.mTooltipButton.changeButtonImage(Path.GFX + 'ui/icons/scroll_02_sw.png');
    }, '', 3);
    this.mTooltipButton.bindTooltip({ contentType: 'ui-element', elementId: 'pokebro.simplerostertooltip' });


    // last button - assets brother, to display the number of player in roster, also can be pressed to move to inventory screen
    var layout = $('<div class="l-button-brother is-brothers"/>');
    var buttonlayout = $('<div class="l-assets-container"/>');
    var image = $('<img/>');
    image.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS);
    buttonlayout.append(image);
    var text = $('<div class="label text-font-small font-bold font-bottom-shadow font-color-assets-positive-value"/>');
    buttonlayout.append(text);
    this.mPlayerBrotherButton = layout.createCustomButton(buttonlayout, function()
    {
        self.notifyBackendBrothersButtonPressed();
    }, '', 2);
    this.mPlayerBrotherButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Assets.Brothers });
    panelLayout.append(layout);



    //-3 bottom row
    row = $('<div class="bottom-row"/>');
    column.append(row);

    // fancy scroll box for selected player details data
    this.mDetailsContainer = $('<div class="details-container"/>');
    row.append(this.mDetailsContainer);

    // stuffs inside the scroll
    this.mScrollBackgroundContainer = $('<div class="scroll-background-container"/>');
    this.mDetailsContainer.append(this.mScrollBackgroundContainer);
    {
        // create: stats progressbars
        this.mStatsContainer = $('<div class="display-block stats"/>');
        this.mScrollBackgroundContainer.append(this.mStatsContainer);
        this.createRowsDIV(this.mStatsRows, this.mStatsContainer);

        // create: portrait to have a clearer look on your selected bro
        this.mPortrait.Container = $('<div class="display-none portrait"/>');
        this.mScrollBackgroundContainer.append(this.mPortrait.Container);
        {
            var portraitContainer = $('<div class="portrait-container"/>');
            this.mPortrait.Container.append(portraitContainer);

            var portraitImageContainer = $('<div class="l-portrait-image-container"/>');
            portraitContainer.append(portraitImageContainer);

            this.mPortrait.Placeholder = portraitImageContainer.createImage('', function (_image)
            {
                self.mPortrait.Placeholder.centerImageWithinParent(0, 0, 1.0, false);
            }, null, 'opacity-almost-none');

            this.mPortrait.Image = portraitImageContainer.createImage('', function (_image)
            {
                self.mPortrait.Image.centerImageWithinParent(0, 0, 1.0, false);
                self.mPortrait.Image.removeClass('opacity-almost-none');
                self.mPortrait.Placeholder.addClass('opacity-almost-none');
                self.mPortrait.Placeholder.attr('src', self.mPortrait.Image.attr('src'));
            }, null, '');

            var nameContainer = $('<div class="name-container"/>');
            this.mPortrait.Container.append(nameContainer);

            this.mPortrait.NameLabel = $('<div class="label title-font-normal font-bold font-color-ink"/>');
            nameContainer.append(this.mPortrait.NameLabel);

            nameContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.LeftPanelHeaderModule.ChangeNameAndTitle });
            nameContainer.click(function ()
            {
                self.openRenamePopupDialog(null);
            });
        }
    }

    // stuffs outside the scroll
    this.mSkills.Container = $('<div class="display-none l-list-container"/>');
    this.mDetailsContainer.append(this.mSkills.Container); 
    {
        this.mSkills.ListContainer = this.mSkills.Container.createList(100, null, true);
        this.mSkills.ListScrollContainer = this.mSkills.ListContainer.findListScrollContainer();

        // create: skills rows
        this.mSkills.ActiveSkillsRow = $('<div class="skills-row"/>');
        this.mSkills.ListScrollContainer.append(this.mSkills.ActiveSkillsRow);
        this.mSkills.PassiveSkillsRow = $('<div class="skills-row"/>');
        this.mSkills.ListScrollContainer.append(this.mSkills.PassiveSkillsRow);
        this.mSkills.StatusEffectsRow = $('<div class="skills-row"/>');
        this.mSkills.ListScrollContainer.append(this.mSkills.StatusEffectsRow);
    }

    

    // player roster
    var detailFrame = $('<div class="background-frame-container"/>');
    row.append(detailFrame);
    this.mPlayer.ListScrollContainer = $('<div class="l-list-container"/>');
    detailFrame.append(this.mPlayer.ListScrollContainer);
    this.createBrotherSlots(this.mPlayer, ModRosterOwner.Player);


    // create footer button bar
    var footerButtonBar = $('<div class="l-button-bar"/>');
    this.mDialogContainer.findDialogFooterContainer().append(footerButtonBar);

    // create: buttons
    var layout = $('<div class="l-leave-button"/>');
    footerButtonBar.append(layout);
    this.mLeaveButton = layout.createTextButton("Leave", function() {
        self.notifyBackendLeaveButtonPressed();
    }, '', 1);

    this.mIsVisible = false;
};


StrongholdPokebroPcDialogModule.prototype.destroyDIV = function ()
{
    this.mAssets.destroyDIV();
    this.destroyRowsDIV(this.mStatsRows);

    this.mLeaveButton.remove();
    this.mLeaveButton = null;

    this.mSkills.ActiveSkillsRow.empty();
    this.mSkills.ActiveSkillsRow.remove();
    this.mSkills.ActiveSkillsRow = null;

    this.mSkills.PassiveSkillsRow.empty();
    this.mSkills.PassiveSkillsRow.remove();
    this.mSkills.PassiveSkillsRow = null;

    this.mSkills.StatusEffectsRow.empty();
    this.mSkills.StatusEffectsRow.remove();
    this.mSkills.StatusEffectsRow = null;

    this.mSkills.ListScrollContainer.empty();
    this.mSkills.ListScrollContainer = null;
    this.mSkills.ListContainer.destroyList();
    this.mSkills.ListContainer = null;

    this.mSkills.Container.empty();
    this.mSkills.Container.remove();
    this.mSkills.Container = null;

    this.mTitleContainer.remove();
    this.mTitleContainer = null;
    this.mDetailsScrollHeaderContainer.remove();
    this.mDetailsScrollHeaderContainer = null;
    this.mButtonBarContainer.remove();
    this.mButtonBarContainer = null;
    
    this.mStatsContainer.remove();
    this.mStatsContainer = null;

    this.mStronghold.ListScrollContainer.empty();
    this.mStronghold.ListScrollContainer = null;
    this.mStronghold.ListContainer.destroyList();
    this.mStronghold.ListContainer.remove();
    this.mStronghold.ListContainer = null;

    this.mPlayer.ListScrollContainer.empty();
    this.mPlayer.ListScrollContainer = null;

    this.mDialogContainer.empty();
    this.mDialogContainer.remove();
    this.mDialogContainer = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


StrongholdPokebroPcDialogModule.prototype.bindTooltips = function ()
{
    this.mAssets.bindTooltips();
    this.mAssets.mBrothersAsset.unbindTooltip();

    // replace with a new tooltip to tell player it's for displaying stronghold roster size
    this.mAssets.mBrothersAsset.bindTooltip({ contentType: 'ui-element', elementId: 'assets.BrothersInStronghold' });

    $.each(this.mStatsRows, function (_key, _value)
    {
        _value.Row.bindTooltip({ contentType: 'ui-element', elementId: _value.TooltipId });
    });

    this.mLeaveButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.WorldTownScreen.HireDialogModule.LeaveButton });
};


StrongholdPokebroPcDialogModule.prototype.unbindTooltips = function ()
{
    this.mAssets.unbindTooltips();

    $.each(this.mStatsRows, function (_key, _value)
    {
        _value.Row.unbindTooltip();
    });

    this.mLeaveButton.unbindTooltip();
};


// generic stuff for a module
StrongholdPokebroPcDialogModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};
StrongholdPokebroPcDialogModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};
StrongholdPokebroPcDialogModule.prototype.register = function (_parentDiv)
{
    console.log('StrongholdPokebroPcDialogModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register World Stronghold Pokemon PC Dialog Module. Reason: World Stronghold Pokemon PC Dialog Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};
StrongholdPokebroPcDialogModule.prototype.unregister = function ()
{
    console.log('StrongholdPokebroPcDialogModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister World Stronghold Pokemon PC Dialog Module. Reason: World Stronghold Pokemon PC Dialog Module is not initialized.');
        return;
    }

    this.destroy();
};
StrongholdPokebroPcDialogModule.prototype.isRegistered = function ()
{
    if (this.mContainer !== null)
    {
        return this.mContainer.parent().length !== 0;
    }

    return false;
};
StrongholdPokebroPcDialogModule.prototype.registerEventListener = function(_listener)
{
    this.mEventListener = _listener;
};
StrongholdPokebroPcDialogModule.prototype.show = function (_withSlideAnimation)
{
    var self = this;

    // make sure somethings to always be set as default value each time you open/close the shit
    this.mToggledType = ToggleScroll.Type.Stats;
    this.mToggledOrder = ToggleScroll.Order.Ascending;
    

    var withAnimation = (_withSlideAnimation !== undefined && _withSlideAnimation !== null) ? _withSlideAnimation : true;
    if (withAnimation === true)
    {
        var offset = -(this.mContainer.parent().width() + this.mContainer.width());
        this.mContainer.css({ 'left': offset });
        this.mContainer.velocity("finish", true).velocity({ opacity: 1, left: '0', right: '0' }, {
            duration: Constants.SCREEN_SLIDE_IN_OUT_DELAY,
            easing: 'swing',
            begin: function () {
                $(this).removeClass('display-none').addClass('display-block');
                self.notifyBackendModuleAnimating();
            },
            complete: function () {
                self.showScroll(false);
                self.mIsVisible = true;
                self.notifyBackendModuleShown();
            }
        });
    }
    else
    {
        this.mContainer.css({ opacity: 0 });
        this.mContainer.velocity("finish", true).velocity({ opacity: 1 }, {
            duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
            easing: 'swing',
            begin: function() {
                $(this).removeClass('display-none').addClass('display-block');
                self.notifyBackendModuleAnimating();
            },
            complete: function() {
                self.mIsVisible = true;
                self.notifyBackendModuleShown();
            }
        });
    }
};
StrongholdPokebroPcDialogModule.prototype.hide = function ()
{
    var self = this;

    var offset = -(this.mContainer.parent().width() + this.mContainer.width());
    this.mContainer.velocity("finish", true).velocity({ opacity: 0, left: offset },
    {
        duration: Constants.SCREEN_SLIDE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function ()
        {
            $(this).removeClass('is-center');
            self.notifyBackendModuleAnimating();
        },
        complete: function ()
        {
            self.mIsVisible = false;
            $(this).removeClass('display-block').addClass('display-none');
            self.notifyBackendModuleHidden();
        }
    });
};
StrongholdPokebroPcDialogModule.prototype.isVisible = function ()
{
    return this.mIsVisible;
};
//--------------------------------------------------------


// Load the Data
StrongholdPokebroPcDialogModule.prototype.loadFromData = function (_data)
{
    if(_data === undefined || _data === null)
    {
        return;
    }
    
    if('Title' in _data && _data.Title !== null)
    {
        this.mDialogContainer.findDialogTitle().html(_data.Title);
    }

    if('SubTitle' in _data && _data.SubTitle !== null)
    {
        this.mDialogContainer.findDialogSubTitle().html(_data.SubTitle);
    }

    if ('SimpleTooltip' in _data && _data.SimpleTooltip !== null)
    {
        this.mSimpleRosterTooltip = _data.SimpleTooltip;

        if(this.mSimpleRosterTooltip === false)
            this.mTooltipButton.changeButtonImage(Path.GFX + 'ui/icons/scroll_02.png');
        else
            this.mTooltipButton.changeButtonImage(Path.GFX + 'ui/icons/scroll_02_sw.png');
    }

    if ('BrothersMax' in _data && _data.BrothersMax !== null)
    {
        this.mPlayerRosterLimit = _data.BrothersMax;
    }

    if ('BrothersMaxInStronghold' in _data && _data.BrothersMaxInStronghold !== null && _data.BrothersMaxInStronghold != this.mStronghold.NumActiveMax)
    {
        this.mStrongholdRosterLimit = _data.BrothersMaxInStronghold;
        this.mStronghold.NumActiveMax = this.mStrongholdRosterLimit;

        // compare then resize the roster slots
        if (this.mStronghold.Slots.length < this.mStrongholdRosterLimit)
        {
            this.mStronghold.ListScrollContainer.empty();
            this.createBrotherSlots(this.mStronghold, ModRosterOwner.Stronghold);
        }
    }
    
    if ('Stronghold' in _data && _data.Stronghold !== null)
    {
        this.mStronghold.BrothersList = _data.Stronghold;
        this.onBrothersListLoaded(this.mStronghold, ModRosterOwner.Stronghold);
    }

    if ('PLayer' in _data && _data.PLayer !== null)
    {
        this.mPlayer.BrothersList = _data.PLayer;
        this.onBrothersListLoaded(this.mPlayer, ModRosterOwner.Player);

        // automatically select the first brother in player roster
        for (var i = 0; i < _data.PLayer.length; i++) 
        {
            var brother = _data.PLayer[i];

            if (brother !== null)
            {
                this.setBrotherSelected(i, ModRosterOwner.Player, true);
                break;
            }
        }
    }

    if('Assets' in _data && _data.Assets !== null)
    {
        if (!('No' in _data.Assets))
            this.mRoster = _data.Assets;

        this.updateAssets(_data.Assets);
    }
};
//-----------------------------



//- scroll shenanigans
StrongholdPokebroPcDialogModule.prototype.toggleScrollShenanigan = function(_withSlideAnimation)
{
    if (this.mToggledType !== ToggleScroll.Type.Skills)
    {
        this.hideScroll(_withSlideAnimation);
    }
    else
    {
        this.showScroll(_withSlideAnimation);
    }

    if (this.mToggledType === ToggleScroll.Min)
        this.mToggledOrder = ToggleScroll.Order.Ascending;
    else if (this.mToggledType === ToggleScroll.Max)
        this.mToggledOrder = ToggleScroll.Order.Descending;
};
StrongholdPokebroPcDialogModule.prototype.hideScroll = function(_withSlideAnimation)
{
    var self = this;

    if (_withSlideAnimation === false)
    {
        this.mScrollBackgroundContainer.css({ height: '', right: 0 });
        this.mScrollBackgroundContainer.removeClass('display-block').addClass('display-none');
        this.mSkills.Container.removeClass('display-none').addClass('display-block');
        this.updateDetailsPanel(null);
    }
    else
    {
        this.mToggledType = this.mToggledType + this.mToggledOrder;
        this.mScrollBackgroundContainer.velocity("finish", true).velocity({ height: 0 },
        {
            duration: Constants.CONTENT_ROLL_IN_OUT_DELAY,
            easing: 'swing',
            complete: function ()
            {
                $(this).removeClass('display-block').addClass('display-none');
                self.mSkills.Container.removeClass('display-none').addClass('display-block');
                self.updateDetailsPanel(null);
            }
        });
    }
};
StrongholdPokebroPcDialogModule.prototype.showScroll = function(_withSlideAnimation)
{
    var self = this;

    if (_withSlideAnimation === false)
    {
        this.mScrollBackgroundContainer.css({ right: 0 });
        this.mScrollBackgroundContainer.removeClass('display-none').addClass('display-block');
        this.mScrollBackgroundContainer.css({ height: '' });
        this.mScrollBackgroundContainer.removeClass('display-none').addClass('display-block');
        this.mStatsContainer.removeClass('display-none').addClass('display-block');
        this.mPortrait.Container.removeClass('display-block').addClass('display-none');
        this.mSkills.Container.removeClass('display-block').addClass('display-none');
        this.updateDetailsPanel(null);
    }
    else
    {
        this.mToggledType = this.mToggledType + this.mToggledOrder;
        var isStats = this.mToggledType == ToggleScroll.Type.Stats;
        // compute content height
        this.mScrollBackgroundContainer.css({ height: '' });
        this.mScrollBackgroundContainer.removeClass('display-none').addClass('display-block');
        var contentHeight = this.mScrollBackgroundContainer.height();
        this.mScrollBackgroundContainer.removeClass('display-block').addClass('display-none');
        this.mScrollBackgroundContainer.css({ height: 0 });

        this.mScrollBackgroundContainer.velocity("finish", true).velocity({ height: contentHeight },
        {
            duration: Constants.CONTENT_ROLL_IN_OUT_DELAY,
            easing: 'swing',
            begin: function ()
            {
                $(this).removeClass('display-none').addClass('display-block');
                self.mSkills.Container.removeClass('display-block').addClass('display-none');
            },
            complete: function ()
            {
                if (isStats)
                {
                    self.mStatsContainer.removeClass('display-none').addClass('display-block');
                    self.mPortrait.Container.removeClass('display-block').addClass('display-none');
                }
                else
                {
                    self.mStatsContainer.removeClass('display-block').addClass('display-none');
                    self.mPortrait.Container.removeClass('display-none').addClass('display-block');
                }

                self.updateDetailsPanel(null);
            }
        });
    }
};
//---------------------------------



//- Skills Panel
StrongholdPokebroPcDialogModule.prototype.addSkillsDIV = function (_parentDiv, _entityId, _data, _isSkill)
{
    if (_data === undefined ||_data === null || !jQuery.isArray(_data))
    {
        console.log('ERROR: Failed to add Skills. Reason: Invalid data.');
        return;
    }

    if (_data.length > 0)
    {
        var containerLayout = $('<div class="l-skills-group-container"/>');
        var container = $('<div class="l-skill-groups-container"/>');
        containerLayout.append(container);

        for (var i = 0; i < _data.length; ++i)
        {
            if (!(CharacterScreenIdentifier.Skill.Id in _data[i]) || !(CharacterScreenIdentifier.Skill.ImagePath in _data[i]))
            {
                continue;
            }

            var image = $('<img/>');
            image.attr('src', Path.GFX + _data[i].imagePath);
            container.append(image);

            if (_isSkill === true)
            {
                image.bindTooltip({ contentType: 'skill', entityId: _entityId, skillId: _data[i].id });
            }
            else
            {
                image.bindTooltip({ contentType: 'status-effect', entityId: _entityId, statusEffectId: _data[i].id });
            }
        }

        if (container.children().length > 0)
        {
            _parentDiv.append(containerLayout);
        }
    }
};
//---------------------------------------



//- Popup Dialog stuffs
StrongholdPokebroPcDialogModule.prototype.openRenamePopupDialog = function (_brotherId)
{
    var self = this;
    var data = 
    {
        Index   : null,
        Tag     : null,
        Brother : null,
    };

    if (_brotherId === null || _brotherId === undefined)
    {
        data.Index = this.mSelectedBrother.Index;
        data.Tag = this.mSelectedBrother.Tag;
        data.Brother = this.getBrotherByIndex(data.Index, data.Tag);
        _brotherId = data.Brother[CharacterScreenIdentifier.Entity.Id];
    }
    else
    {
        data = this.getBrotherByID(_brotherId);
    }

    if (data.Index === null || data.Tag == null)
        return;

    this.notifyBackendPopupDialogIsVisible(true);
    this.mCurrentPopupDialog = $('.world-town-screen').createPopupDialog('Change Name & Title', null, null, 'change-name-and-title-popup');

    this.mCurrentPopupDialog.addPopupDialogOkButton(function (_dialog)
    {
        self.updateNameAndTitle(_dialog, _brotherId, data.Tag);
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });
    
    this.mCurrentPopupDialog.addPopupDialogCancelButton(function (_dialog)
    {
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });

    this.mCurrentPopupDialog.addPopupDialogContent(this.createChangeNameAndTitleDialogContent(this.mCurrentPopupDialog, data.Brother));

    // focus!
    var inputFields = this.mCurrentPopupDialog.findPopupDialogContentContainer().find('input');
    $(inputFields[0]).focus();
};
StrongholdPokebroPcDialogModule.prototype.createChangeNameAndTitleDialogContent = function (_dialog, _brother)
{
    var data = _brother;
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
StrongholdPokebroPcDialogModule.prototype.openDismissPopupDialog = function (_brotherId)
{
    var self = this;
    var data = 
    {
        Index   : null,
        Tag     : null,
        Brother : null,
    };

    if (_brotherId === null || _brotherId === undefined)
    {
        data.Index = this.mSelectedBrother.Index;
        data.Tag = this.mSelectedBrother.Tag;
        data.Brother = this.getBrotherByIndex(data.Index, data.Tag);
        _brotherId = data.Brother[CharacterScreenIdentifier.Entity.Id];
    }
    else
    {
        data = this.getBrotherByID(_brotherId);
    }

    if (data.Index === null || data.Tag == null)
        return;

    if (data.Brother[CharacterScreenIdentifier.Entity.Character.Key][CharacterScreenIdentifier.Entity.Character.IsPlayerCharacter] === true)
        return;

    this.mPayDismissalWage = false;
    this.notifyBackendPopupDialogIsVisible(true);
    this.mCurrentPopupDialog = $('.world-town-screen').createPopupDialog('Dismiss', null, null, 'dismiss-popup');

    this.mCurrentPopupDialog.addPopupDialogOkButton(function (_dialog)
    {
        self.notifyBackendDismissCharacter(self.mPayDismissalWage, _brotherId, data.Tag);
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });
    
    this.mCurrentPopupDialog.addPopupDialogCancelButton(function (_dialog)
    {
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });

    this.mCurrentPopupDialog.addPopupDialogContent(this.createDismissDialogContent(this.mCurrentPopupDialog, data.Brother));
};
StrongholdPokebroPcDialogModule.prototype.createDismissDialogContent = function (_dialog, _brother)
{
    var self = this;
    var data = _brother;
    var selectedBrother = CharacterScreenIdentifier.Entity.Character.Key in data ? data[CharacterScreenIdentifier.Entity.Character.Key] : null;
    if (selectedBrother === null)
    {
        console.error('Failed to create dialog content. Reason: No brother selected.');
        return null;
    }

    var result = $('<div class="dismiss-character-container"/>');
    var titleLabel;

    if (selectedBrother['dailyMoneyCost'] == 0)
        titleLabel = $('<div class="title-label title-font-normal font-bold font-color-title">Really free ' + selectedBrother[CharacterScreenIdentifier.Entity.Character.Name] + '?</div>');
    else
        titleLabel = $('<div class="title-label title-font-normal font-bold font-color-title">Really dismiss ' + selectedBrother[CharacterScreenIdentifier.Entity.Character.Name] + '?</div>');

    result.append(titleLabel);

    var textLabel = $('<div class="label text-font-medium font-color-description font-style-normal">' + selectedBrother[CharacterScreenIdentifier.Entity.Character.Name] + ' will permanently leave you and place his <br/>current equipment in the stash.</div>');
    result.append(textLabel);

    // ---

    var retirementPackage = $('<div class="retirement-package"/>');
    result.append(retirementPackage);

    var checkbox = $('<input type="checkbox" class="compensation-checkbox" id="compensation" name="display"/>');
    retirementPackage.append(checkbox);

    var checkboxLabel;

    if (selectedBrother['dailyMoneyCost'] == 0)
        checkboxLabel = $('<label class="blub text-font-medium font-color-subtitle font-style-normal" for="compensation">Pay <img src="' + Path.GFX + Asset.ICON_MONEY_SMALL + '"/>' + (Math.max(1, selectedBrother['daysWithCompany']) * 10) + ' Reparations</label>');
    else
        checkboxLabel = $('<label class="blub text-font-medium font-color-subtitle font-style-normal" for="compensation">Pay <img src="' + Path.GFX + Asset.ICON_MONEY_SMALL + '"/>' + (Math.max(1, selectedBrother['daysWithCompany']) * 10) + ' Compensation</label>');

    retirementPackage.append(checkboxLabel);

    checkboxLabel.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.CharacterScreen.DismissPopupDialog.Compensation });

    checkbox.iCheck({
        checkboxClass: 'icheckbox_flat-orange',
        radioClass: 'iradio_flat-orange',
        increaseArea: '0%'
    });

    checkbox.on('ifChecked ifUnchecked', null, this, function (_event)
    {
        self.mPayDismissalWage = checkbox.prop('checked') === true;
    });

    return result;
};
StrongholdPokebroPcDialogModule.prototype.openTransferConfirmationPopupDialog = function (_data)
{
    var self = this;

    this.notifyBackendPopupDialogIsVisible(true);
    this.mCurrentPopupDialog = $('.world-town-screen').createPopupDialog('Warning', null, null, 'dismiss-popup');

    this.mCurrentPopupDialog.addPopupDialogOkButton(function (_dialog)
    {
        self.notifyBackendTransferItems();
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });
    
    this.mCurrentPopupDialog.addPopupDialogCancelButton(function (_dialog)
    {
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });

    this.mCurrentPopupDialog.addPopupDialogContent(this.createTransferConfirmationDialogContent(this.mCurrentPopupDialog, _data));
};
StrongholdPokebroPcDialogModule.prototype.createTransferConfirmationDialogContent = function (_dialog, _data)
{
    var self = this;
    var difference = _data['ItemsNum'] - _data['StashNum'];

    var result = $('<div class="dismiss-character-container"/>');
    var titleLabel = $('<div class="title-label title-font-normal font-bold font-color-title">Insufficient Stash Slot</div>');

    result.append(titleLabel);

    var textLabel = $('<div class="label text-font-medium font-color-description font-style-normal">Your stash needs to free ' + difference + ' slot(s) or <br/>any excess will be discarded and lost forever.</div>');
    result.append(textLabel);

    return result;
};
StrongholdPokebroPcDialogModule.prototype.openPerkPopupDialog = function (_brotherId)
{
    var self = this;
    var data = 
    {
        Index   : null,
        Tag     : null,
        Brother : null,
    };

    if (_brotherId === null || _brotherId === undefined)
    {
        data.Index = this.mSelectedBrother.Index;
        data.Tag = this.mSelectedBrother.Tag;
        data.Brother = this.getBrotherByIndex(data.Index, data.Tag);
    }
    else
    {
        data = this.getBrotherByID(_brotherId);
    }

    if (data.Index === null || data.Tag == null) 
        return;

    this.notifyBackendPopupDialogIsVisible(true);
    this.mPerkTree = null;
    this.mPerkRows = [];
    this.mCurrentPopupDialog = $('.world-town-screen').createPopupDialog('Perk Tree', null, null, 'perk-popup');

    this.mCurrentPopupDialog.addPopupDialogCancelButton(function (_dialog)
    {
        self.mPerkTree = null;
        self.mPerkRows = [];
        self.mCurrentPopupDialog = null;
        _dialog.destroyPopupDialog();
        self.notifyBackendPopupDialogIsVisible(false);
    });
    this.mCurrentPopupDialog.findPopupDialogCancelButton().changeButtonText('Return');
    this.mCurrentPopupDialog.addPopupDialogContent(this.createPerkDialogContent(this.mCurrentPopupDialog, data.Brother));
};
StrongholdPokebroPcDialogModule.prototype.createPerkDialogContent = function(_definitions, _brother)
{
    var container = $('<div class="perk-tree-container"/>');

    this.createPerkTreeDIV(_brother[CharacterScreenIdentifier.Perk.Tree], container);
    this.setupPerksEventHandlers(this.mPerkTree);
    this.initPerkTree(this.mPerkTree, _brother[CharacterScreenIdentifier.Perk.Key], _brother);
    this.setupPerkTreeTooltips(this.mPerkTree, _brother[CharacterScreenIdentifier.Entity.Id]);

    return container;
};
StrongholdPokebroPcDialogModule.prototype.setupPerkTreeTooltips = function(_perkTree, _brotherId)
{
    for (var row = 0; row < _perkTree.length; ++row)
    {
        for (var i = 0; i < _perkTree[row].length; ++i)
        {
            var perk = _perkTree[row][i];
            perk.Image.unbindTooltip();
            perk.Image.bindTooltip({ contentType: 'ui-perk', entityId: _brotherId, perkId: perk.ID });
        }
    }
};
StrongholdPokebroPcDialogModule.prototype.initPerkTree = function (_perkTree, _perksUnlocked, _brother)
{
    var perkPointsSpent = this.getBrotherPerkPointsSpent(_brother);

    for (var row = 0; row < _perkTree.length; ++row)
    {
        for (var i = 0; i < _perkTree[row].length; ++i)
        {
            var perk = _perkTree[row][i];

            for (var j = 0; j < _perksUnlocked.length; ++j)
            {
                if(_perksUnlocked[j] == perk.ID)
                {
                    perk.Unlocked = true;

                    perk.Image.attr('src', Path.GFX + perk.Icon);

                    var selectionLayer = perk.Container.find('.selection-image-layer:first');
                    selectionLayer.removeClass('display-none').addClass('display-block');

                    break;
                }
            }
        }
    }
    
    for (var row = 0; row < this.mPerkRows.length; ++row)
    {
        if (row <= perkPointsSpent)
        {
            this.mPerkRows[row].addClass('is-unlocked').removeClass('is-locked');
        }
        else
        {
            break;
        }
    }
};
StrongholdPokebroPcDialogModule.prototype.setupPerksEventHandlers = function(_perkTree)
{
    var self = this;

    for (var row = 0; row < _perkTree.length; ++row)
    {
        for (var i = 0; i < _perkTree[row].length; ++i)
        {
            var perk = _perkTree[row][i];

            perk.Container.on('mouseenter focus' + CharacterScreenIdentifier.KeyEvent.PerksModuleNamespace, null, this, function (_event)
            {
                var selectable = !perk.Unlocked;

                if (selectable === true)
                {
                    var selectionLayer = $(this).find('.selection-image-layer:first');
                    selectionLayer.removeClass('display-none').addClass('display-block');
                }
            });

            perk.Container.on('mouseleave blur' + CharacterScreenIdentifier.KeyEvent.PerksModuleNamespace, null, this, function (_event)
            {
                var selectable = !perk.Unlocked;

                if (selectable === true)
                {
                    var selectionLayer = $(this).find('.selection-image-layer:first');
                    selectionLayer.removeClass('display-block').addClass('display-none');
                }
            });
        }
    }
};
StrongholdPokebroPcDialogModule.prototype.createPerkTreeDIV = function (_perkTree, _parentDiv)
{
    this.mPerkTree = _perkTree;
    var self = this;

    for (var row = 0; row < _perkTree.length; ++row)
    {
        var rowDIV = $('<div class="row"/>');
        rowDIV.css({ 'left' : 0, 'top': (row * 6.0) + 'rem' }); // css is retarded?
        _parentDiv.append(rowDIV);

        var centerDIV = $('<div class="center"/>');
        rowDIV.append(centerDIV);

        this.mPerkRows[row] = rowDIV;

        for (var i = 0; i < _perkTree[row].length; ++i)
        {
            var perk = _perkTree[row][i];
            perk.Unlocked = false;

            perk.Container = $('<div class="l-perk-container"/>');
            centerDIV.append(perk.Container);

            var perkSelectionImage = $('<img class="selection-image-layer display-none"/>');
            perkSelectionImage.attr('src', Path.GFX + Asset.PERK_SELECTION_FRAME);
            perk.Container.append(perkSelectionImage);

            perk.Image = $('<img class="perk-image-layer"/>');
            perk.Image.attr('src', Path.GFX + perk.IconDisabled);
            perk.Container.append(perk.Image);
        }

        centerDIV.css({ 'width': (5.0 * _perkTree[row].length) + 'rem' }); // css is retarded?

        // css is retarded? fortunately this fixes the center issue
        centerDIV.css({'right': '0rem'});
        centerDIV.css({'left': '0rem'}); 
        centerDIV.css({'margin': 'auto'});
    }
};
//------------------------------


//- Progress bars bah bah bah
StrongholdPokebroPcDialogModule.prototype.createRowsDIV = function(_definitions, _parentDiv)
{
    $.each(_definitions, function (_key, _value)
    {
        _value.Row = $('<div class="stats-row"/>');
        _parentDiv.append(_value.Row);
        var leftStatsRowLayout = $('<div class="l-stats-row"/>');
        _value.Row.append(leftStatsRowLayout);

        var statsRowIconLayout = $('<div class="l-stats-row-icon-column"/>');
        leftStatsRowLayout.append(statsRowIconLayout);
        var statsRowIcon = $('<img/>');
        statsRowIcon.attr('src', _value.IconPath);
        statsRowIconLayout.append(statsRowIcon);

        var statsRowProgressbarLayout = $('<div class="l-stats-row-progressbar-column"/>');
        leftStatsRowLayout.append(statsRowProgressbarLayout);
        var statsRowProgressbarContainer = $('<div class="stats-progressbar-container"/>');
        statsRowProgressbarLayout.append(statsRowProgressbarContainer);

        _value.Progressbar = statsRowProgressbarContainer.createProgressbar(true, _value.StyleName);

        _value.Talent = $('<img class="talent"/>');
        statsRowIconLayout.append(_value.Talent);
    });
};
StrongholdPokebroPcDialogModule.prototype.destroyRowsDIV = function(_definitions)
{
    $.each(_definitions, function (_key, _value)
    {
        _value.Progressbar.empty();
        _value.Progressbar.remove();
        _value.Progressbar = null;

        _value.Row.empty();
        _value.Row.remove();
        _value.Row = null;
    });
};
StrongholdPokebroPcDialogModule.prototype.setProgressbarValue = function (_progressbarDiv, _data, _valueKey, _valueMaxKey, _labelKey)
{
    if (_valueKey in _data && _data[_valueKey] !== null && _valueMaxKey in _data && _data[_valueMaxKey] !== null)
    {
        _progressbarDiv.changeProgressbarNormalWidth(_data[_valueKey], _data[_valueMaxKey]);

        if (_labelKey in _data && _data[_labelKey] !== null)
        {
            _progressbarDiv.changeProgressbarLabel(_data[_labelKey]);
        }
        else
        {
            switch(_valueKey)
            {
                //case ProgressbarValueIdentifier.ArmorHead:
                //case ProgressbarValueIdentifier.ArmorBody:
                case ProgressbarValueIdentifier.Hitpoints:
                case ProgressbarValueIdentifier.Fatigue:
                {
                    _progressbarDiv.changeProgressbarLabel('' + _data[_valueKey] + ' / ' + _data[_valueMaxKey] + '');
                } break;
                default:
                {
                    _progressbarDiv.changeProgressbarLabel('' + _data[_valueKey]);
                }
            }
        }
    }
};
StrongholdPokebroPcDialogModule.prototype.setTalentValue = function (_something, _data)
{
    _something.Talent.attr('src', Path.GFX + 'ui/icons/talent_' + _data + '.png');
    _something.Talent.css({ 'width': '3.6rem', 'height': '1.8rem' });
}
//------------------------------------



StrongholdPokebroPcDialogModule.prototype.getBrotherPerkPointsSpent = function (_brother)
{
    if (_brother === null || !(CharacterScreenIdentifier.Entity.Character.Key in _brother))
    {
        return 0;
    }

    var character = _brother[CharacterScreenIdentifier.Entity.Character.Key];
    if (character === null)
    {
        return 0;
    }

    if (CharacterScreenIdentifier.Entity.Character.PerkPoints in character)
    {
        var perkPoints = character[CharacterScreenIdentifier.Entity.Character.PerkPointsSpent];
        if (perkPoints !== null && typeof (perkPoints) == 'number')
        {
            return perkPoints;
        }
    }

    return 0;
};
StrongholdPokebroPcDialogModule.prototype.getNumBrothers = function (_brothersList)
{
    var num = 0;

    for (var i = 0; i != _brothersList.length; ++i)
    {
        if(_brothersList[i] !== null)
            ++num;
    }

    return num;
};

StrongholdPokebroPcDialogModule.prototype.getIndexOfFirstEmptySlot = function (_slots)
{
    for (var i = 0; i < _slots.length; i++) 
    {
        if (_slots[i].data('child') == null)
        {
            return i;
        }
    }
}

StrongholdPokebroPcDialogModule.prototype.setBrotherSelected = function (_rosterPosition, _rosterTag, _withoutNotify)
{
    var brother = this.getBrotherByIndex(_rosterPosition, _rosterTag);

    if (brother === null || brother === undefined)
        return;

    this.mSelectedBrother.Index = _rosterPosition;
    this.mSelectedBrother.Tag = _rosterTag;
    this.removeCurrentBrotherSlotSelection();
    this.selectBrotherSlot(brother[CharacterScreenIdentifier.Entity.Id]);
    this.updateDetailsPanel(brother);

    // notify update
    if (_withoutNotify === undefined || _withoutNotify !== true)
    {
        var parent = _rosterTag == ModRosterOwner.Player ? this.mPlayer : this.mStronghold;
        this.onBrothersListLoaded(parent, _rosterTag);
    }
};

StrongholdPokebroPcDialogModule.prototype.getBrotherByIndex = function (_index, _tag)
{
    if (_tag === ModRosterOwner.Player)
    {
        if (_index < this.mPlayer.BrothersList.length)
            return this.mPlayer.BrothersList[_index];
    }
    else
    {
        if (_index < this.mStronghold.BrothersList.length)
            return this.mStronghold.BrothersList[_index];
    }

    return null;
};


StrongholdPokebroPcDialogModule.prototype.getBrotherByID = function (_brotherId)
{
    var data = 
    {
        Index   : null,
        Tag     : null,
        Brother : null,
    };

    // find selected one
    if (this.mPlayer.BrothersList !== null && jQuery.isArray(this.mPlayer.BrothersList))
    {
        for (var i = 0; i < this.mPlayer.BrothersList.length; ++i)
        {
            var brother = this.mPlayer.BrothersList[i];
 
            if (brother != null && CharacterScreenIdentifier.Entity.Id in brother && brother[CharacterScreenIdentifier.Entity.Id] === _brotherId)
            {
                data.Index = i;
                data.Tag = ModRosterOwner.Player;
                data.Brother = brother;
                return data;
            }
        }
    }

    if (this.mStronghold.BrothersList !== null && jQuery.isArray(this.mStronghold.BrothersList))
    {
        for (var i = 0; i < this.mStronghold.BrothersList.length; ++i)
        {
            var brother = this.mStronghold.BrothersList[i];

            if (brother !== null && CharacterScreenIdentifier.Entity.Id in brother && brother[CharacterScreenIdentifier.Entity.Id] === _brotherId)
            {
                data.Index = i;
                data.Tag = ModRosterOwner.Stronghold;
                data.Brother = brother;
                return data;
            }
        }
    }

    return data;
};

StrongholdPokebroPcDialogModule.prototype.setBrotherSelectedByID = function (_brotherId)
{
    var data = this.getBrotherByID(_brotherId);

    if (data.Index !== null && data.Tag !== null)
    {
        this.mSelectedBrother.Index = data.Index;
        this.mSelectedBrother.Tag = data.Tag;
        this.removeCurrentBrotherSlotSelection();
        this.selectBrotherSlot(_brotherId);
        this.updateDetailsPanel(data.Brother);
    }
};


StrongholdPokebroPcDialogModule.prototype.removeCurrentBrotherSlotSelection = function ()
{
    this.mStronghold.ListScrollContainer.find('.is-selected').each(function (index, element)
    {
        var slot = $(element);
        slot.removeClass('is-selected');
    });
    this.mPlayer.ListScrollContainer.find('.is-selected').each(function (index, element)
    {
        var slot = $(element);
        slot.removeClass('is-selected');
    });
};


StrongholdPokebroPcDialogModule.prototype.selectBrotherSlot = function (_brotherId)
{
    var listScrollContainer = this.mSelectedBrother.Tag == ModRosterOwner.Player ? this.mPlayer.ListScrollContainer : this.mStronghold.ListScrollContainer;
    var slot = listScrollContainer.find('#slot-index_' + _brotherId + ':first');
    if (slot.length > 0)
    {
        slot.addClass('is-selected');
    }
};


// move brother to the other roster on right-click
StrongholdPokebroPcDialogModule.prototype.quickMoveBrother = function (_source)
{
    var _brother = _source.data('brother');

    // check if both roster is full
    if (this.mStronghold.NumActive === this.mStronghold.NumActiveMax && this.mPlayer.NumActive === this.mPlayer.NumActiveMax)
    {
        return false;
    }

    var data = this.getBrotherByID(_brother[CharacterScreenIdentifier.Entity.Id]);

    if (data.Index === null || data.Tag === null)
    {
        return false;
    }

    // selected brother is in player roster
    if (data.Tag === ModRosterOwner.Player)
    {  
        // deny when the selected brother is a player character
        if (_source.data('player') === true)
            return false;

        // deny when player roster only has 1 bro
        if (this.mPlayer.NumActive === this.mPlayer.NumActiveMin)
            return false;

        // deny when stronghold roster is full
        if (this.mStronghold.NumActive === this.mStronghold.NumActiveMax)
            return false;

        // transfer brother from player roster to stronghold roster
        var firstEmptySlot = this.getIndexOfFirstEmptySlot(this.mStronghold.Slots);
        this.swapSlots(data.Index, ModRosterOwner.Player, firstEmptySlot, ModRosterOwner.Stronghold);
    }
    // selected brother is in stronghold roster
    else
    {
        // deny when player roster has reached brothers max
        if (this.mPlayer.NumActive >= this.mPlayerRosterLimit)
            return false;

        // deny when player roster is full
        if (this.mPlayer.NumActive === this.mPlayer.NumActiveMax)
            return false;

        // transfer brother from stronghold roster to player roster
        var firstEmptySlot = this.getIndexOfFirstEmptySlot(this.mPlayer.Slots);
        this.swapSlots(data.Index, ModRosterOwner.Stronghold, firstEmptySlot, ModRosterOwner.Player);
    }

    return true;
};


// swap the brother data so i don't have to update the whole roster
StrongholdPokebroPcDialogModule.prototype.swapBrothers = function (_a, _parentA, _b, _parentB)
{
    var tmp = _parentA.BrothersList[_a];
    _parentA.BrothersList[_a] = _parentB.BrothersList[_b];
    _parentB.BrothersList[_b] = tmp;
}


StrongholdPokebroPcDialogModule.prototype.swapSlots = function (_a, _tagA, _b, _tagB)
{
    var isDifferenceRoster = _tagA != _tagB;
    var parentA = _tagA == ModRosterOwner.Player ? this.mPlayer : this.mStronghold;
    var parentB = _tagB == ModRosterOwner.Player ? this.mPlayer : this.mStronghold;
    var slotA = parentA.Slots[_a];
    var slotB = parentB.Slots[_b];

    // dragging or transfering into empty slot
    if(slotB.data('child') == null)
    {
        var A = slotA.data('child');

        A.data('idx', _b);
        A.appendTo(slotB);

        if (isDifferenceRoster)
        {
            A.data('tag', _tagB);
        }

        slotB.data('child', A);
        slotA.data('child', null);

        if (isDifferenceRoster)
        {
            --parentA.NumActive;
            ++parentB.NumActive;
            this.notifyBackendMoveAtoB(A.data('ID'), _tagA, _b, _tagB);
        }
        else
        {
            this.notifyBackendUpdateRosterPosition(A.data('ID'), _b);
        }

        this.swapBrothers(_a, parentA, _b, parentB);

        if(this.mSelectedBrother.Index == _a && this.mSelectedBrother.Tag == _tagA)
        {
            this.setBrotherSelected(_b, _tagB, true);
        }
    }

    // swapping two full slots
    else
    {
        var A = slotA.data('child');
        var B = slotB.data('child');

        A.data('idx', _b);
        B.data('idx', _a);

        if (isDifferenceRoster)
        {
            A.data('tag', _tagB);
            B.data('tag', _tagA);
        }

        B.detach();

        A.appendTo(slotB);
        slotB.data('child', A);

        B.appendTo(slotA);
        slotA.data('child', B);

        if (isDifferenceRoster)
        {
            this.notifyBackendMoveAtoB(A.data('ID'), _tagA, _b, _tagB);
            this.notifyBackendMoveAtoB(B.data('ID'), _tagB, _a, _tagA);
        }
        else
        {
            this.notifyBackendUpdateRosterPosition(A.data('ID'), _b);
            this.notifyBackendUpdateRosterPosition(B.data('ID'), _a);
        }

        this.swapBrothers(_a, parentA, _b, parentB);

        if(this.mSelectedBrother.Index == _a && this.mSelectedBrother.Tag == _tagA)
        {
            this.setBrotherSelected(_b, _tagB, true);
        }
        else if(this.mSelectedBrother.Index == _b && this.mSelectedBrother.Tag == _tagB)
        {
            this.setBrotherSelected(_a, _tagA, true);
        }
    }

    //this.updateRosterLabel();
}


// create empty slots  
StrongholdPokebroPcDialogModule.prototype.createBrotherSlots = function ( _parent , _tag )
{
    var self = this;
    var isPlayer = _tag === ModRosterOwner.Player;
    _parent.Slots = [];

    for (var i = 0 ; i < _parent.NumActiveMax; i++) 
    {
        _parent.Slots.push(null);
    }

    // event listener when dragging then drop bro to an empty slot
    var dropHandler = function (ev, dd)
    {
        var drag = $(dd.drag);
        var drop = $(dd.drop);
        var proxy = $(dd.proxy);

        if (proxy === undefined || proxy.data('idx') === undefined || drop === undefined || drop.data('idx') === undefined)
        {
            return false;
        }

        drag.removeClass('is-dragged');
        
        if (drag.data('tag') == drop.data('tag'))
        {
            if (drag.data('idx') == drop.data('idx'))
                return false;
        }
        else
        {
            // deny when the dragged brother is a player character
            if (drag.data('player') === true)
                return false;

            // deny when the player roster has reached brothers max
            if (drag.data('tag') === ModRosterOwner.Stronghold && self.mPlayer.NumActive >= self.mPlayerRosterLimit)
                return false;
        }

        // number in formation is limited
        if (_parent.NumActive >= _parent.NumActiveMax && drag.data('idx') > _parent.NumActiveMax && drop.data('idx') <= _parent.NumActiveMax && _parent.Slots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // always keep at least 1 in formation
        if (_parent.NumActive == _parent.NumActiveMin && drag.data('idx') <= _parent.NumActiveMax && drop.data('idx') > _parent.NumActiveMax && _parent.Slots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // do the swapping
        self.swapSlots(drag.data('idx'), drag.data('tag'), drop.data('idx'), drop.data('tag'));
    };

    for (var i = 0; i < _parent.Slots.length; ++i)
    {
        if (isPlayer)
            _parent.Slots[i] = $('<div class="ui-control is-brother-slot is-roster-slot"/>');
        else
            _parent.Slots[i] = $('<div class="ui-control is-brother-slot is-reserve-slot"/>');
        
        _parent.ListScrollContainer.append(_parent.Slots[i]);

        _parent.Slots[i].data('idx', i);
        _parent.Slots[i].data('tag', _tag);
        _parent.Slots[i].data('child', null);
        _parent.Slots[i].drop("end", dropHandler);
    }
};
// add brother to empty slot
StrongholdPokebroPcDialogModule.prototype.addBrotherSlotDIV = function(_parent, _data, _index, _tag)
{
    var self = this;
    var parentDiv = _parent.Slots[_index];
    var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
    var id = _data[CharacterScreenIdentifier.Entity.Id];

    // create: slot & background layer
    var result = parentDiv.createListBrother(id);
    result.attr('id', 'slot-index_' + id);
    result.data('ID', id);
    result.data('player', (CharacterScreenIdentifier.Entity.Character.IsPlayerCharacter in character ? character[CharacterScreenIdentifier.Entity.Character.IsPlayerCharacter] : false));
    result.data('idx', _index);
    result.data('tag', _tag);
    result.unbindTooltip();
    result.bindTooltip({ contentType: 'ui-element', entityId: id, elementId: 'pokebro.roster' });
    parentDiv.data('child', result);
    ++_parent.NumActive;

    // some event listener for brother slot to drag and drop
    result.drag("start", function (ev, dd)
    {
        // build proxy
        var proxy = $('<div class="ui-control brother is-proxy"/>');
        proxy.appendTo(document.body);
        proxy.data('idx', _index);

        var imageLayer = result.find('.image-layer:first');
        if (imageLayer.length > 0)
        {
            imageLayer = imageLayer.clone();
            proxy.append(imageLayer);
        }

        $(dd.drag).addClass('is-dragged');

        return proxy;
    }, { distance: 3 });
    result.drag(function (ev, dd)
    {
        $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX });
    }, { relative: false, distance: 3 });
    result.drag("end", function (ev, dd)
    {
        var drag = $(dd.drag);
        var drop = $(dd.drop);
        var proxy = $(dd.proxy);

        var allowDragEnd = true; // TODO: check what we're dropping onto

        // not dropped into anything?
        if (drop.length === 0 || allowDragEnd === false)
        {
            proxy.velocity("finish", true).velocity({ top: dd.originalY, left: dd.originalX },
            {
                duration: 300,
                complete: function ()
                {
                    proxy.remove();
                    drag.removeClass('is-dragged');
                }
            });
        }
        else
        {
            proxy.remove();
        }
    }, { drop: '.is-brother-slot' });

    // update image & name
    var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
    var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

    result.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);
    
    // the mood icon is messed up in the screen, i hate it so i hide it, problem solve with minimum effort
    //result.showListBrotherMoodImage(this.IsMoodVisible, character['moodIcon']);

    for(var i = 0; i != _data['injuries'].length && i < 3; ++i)
    {
        result.assignListBrotherStatusEffect(_data['injuries'][i].imagePath, _data[CharacterScreenIdentifier.Entity.Id], _data['injuries'][i].id)
    }

    if(_data['injuries'].length <= 2 && _data['stats'].hitpoints < _data['stats'].hitpointsMax)
    {
        result.assignListBrotherDaysWounded();
    }

    // event listener when left-click the brother
    result.assignListBrotherClickHandler(function (_brother, _event)
    {
        var data = _brother.data('brother')[CharacterScreenIdentifier.Entity.Id];
        var openPerkTree = (KeyModiferConstants.AltKey in _event && _event[KeyModiferConstants.AltKey] === true);
        var dismissBrother = (KeyModiferConstants.CtrlKey in _event && _event[KeyModiferConstants.CtrlKey] === true);

        if (openPerkTree)
            self.openPerkPopupDialog(data);
        else if (dismissBrother)
            self.openDismissPopupDialog(data);
        else
            self.setBrotherSelectedByID(data);
    });

    // event listener when right-click the brother
    result.mousedown(function (event)
    {
        if (event.which === 3)
        {
            //var data = $(this).data('brother');
            //var data = $(this);
            return self.quickMoveBrother($(this));
        }
    });
};


StrongholdPokebroPcDialogModule.prototype.onBrothersListLoaded = function (_parent, _tag)
{
    for(var i = 0; i != _parent.Slots.length; ++i)
    {
        _parent.Slots[i].empty();
        _parent.Slots[i].data('child', null);
    }

    _parent.NumActive = 0;   

    if (_parent.BrothersList === null || !jQuery.isArray(_parent.BrothersList) || _parent.BrothersList.length === 0)
    {
        return;
    }

    for (var i = 0; i < _parent.BrothersList.length; ++i)
    {
        var brother = _parent.BrothersList[i];

        if (brother !== null)
        {
            this.addBrotherSlotDIV(_parent, brother, i, _tag);   
        }
    }

    //this.updateRosterLabel();
};


//- Update some shits
StrongholdPokebroPcDialogModule.prototype.updateAssets = function (_data)
{
    var value = null;
    var maxValue = null;
    var previousValue = null;
    var valueDifference = null;
    var currentAssetInformation = _data;
    var previousAssetInformation = this.mRoster;

    if ('Brothers' in _data && 'BrothersMax' in _data)
    {
        value = currentAssetInformation['Brothers'];
        maxValue = currentAssetInformation['BrothersMax'];
        previousValue = previousAssetInformation['Brothers'];
        valueDifference = value - previousValue;

        this.updateAssetValue(this.mPlayerBrotherButton, value, maxValue, valueDifference);
    }

    if ('StrongholdBrothers' in _data && 'StrongholdBrothersMax' in _data)
    {
        value = currentAssetInformation['StrongholdBrothers'];
        maxValue = currentAssetInformation['StrongholdBrothersMax'] > this.mStronghold.NumActiveMax ? this.mStronghold.NumActiveMax : currentAssetInformation['StrongholdBrothersMax'];
        previousValue = previousAssetInformation['StrongholdBrothers'];
        valueDifference = value - previousValue;

        this.updateAssetValue(this.mAssets.mBrothersAsset, value, maxValue, valueDifference);
    }
}

StrongholdPokebroPcDialogModule.prototype.updateAssetValue = function (_container, _value, _valueMax, _valueDifference)
{
    var label = _container.find('.label:first');

    if(label.length > 0)
    {
        if(_valueMax !== undefined && _valueMax !== null)
        {
            label.html('' + Helper.numberWithCommas(_value) + '/' + Helper.numberWithCommas(_valueMax));
        }
        else
        {
            label.html(Helper.numberWithCommas(_value));
        }

        if(_valueDifference !== null && _valueDifference !== 0)
        {
            label.animateValueAndFadeOut(_valueDifference < 0, function (_element)
            {
                _element.html(_valueDifference);
            });
        }

        if(_value <= 0)
        {
            label.removeClass('font-color-assets-positive-value').addClass('font-color-assets-negative-value');
        }
        else
        {
            label.removeClass('font-color-assets-negative-value').addClass('font-color-assets-positive-value');
        }
    }
};
// update a currently selected brother
StrongholdPokebroPcDialogModule.prototype.updateSelectedBrother = function (_data)
{
    if (_data === undefined || _data === null || typeof (_data) !== 'object')
    {
        console.error('ERROR: Failed to update selected brother. Invalid data result.');
        return;
    }

    var index = this.mSelectedBrother.Index;
    var tag = this.mSelectedBrother.Tag;
    var parent = tag == ModRosterOwner.Player ? this.mPlayer : this.mStronghold;
    parent.BrothersList[index] = _data;
    parent.Slots[index].empty();
    parent.Slots[index].data('child', null);
    this.addBrotherSlotDIV(parent, _data, index, tag);
    this.updateDetailsPanel(_data);
}
StrongholdPokebroPcDialogModule.prototype.updateDetailsPanel = function (_brother)
{
    if (_brother === null)
    {
        var find = this.getBrotherByIndex(this.mSelectedBrother.Index, this.mSelectedBrother.Tag);

        if (find === null)
            return;
        else
            _brother = find;
    }

    switch(this.mToggledType)
    {
    case ToggleScroll.Type.Portrait:
        this.mTitleContainer.html('Portrait');
        if (_brother !== undefined && CharacterScreenIdentifier.Entity.Character.Key in _brother)
        {
            var character = _brother[CharacterScreenIdentifier.Entity.Character.Key];

            if (CharacterScreenIdentifier.Entity.Character.ImagePath in character)
                this.setPortraitImage(character[CharacterScreenIdentifier.Entity.Character.ImagePath]);

            if (CharacterScreenIdentifier.Entity.Character.Name in character)
                this.mPortrait.NameLabel.html(character[CharacterScreenIdentifier.Entity.Character.Name]);
        }
        break;

    case ToggleScroll.Type.Skills:
        this.mTitleContainer.html('Skills');
        if (_brother !== undefined && CharacterScreenIdentifier.Entity.Id in _brother)
        {
            if (CharacterScreenIdentifier.SkillTypes.ActiveSkills in _brother)
                this.addSkills(this.mSkills.ActiveSkillsRow, _brother[CharacterScreenIdentifier.Entity.Id], _brother[CharacterScreenIdentifier.SkillTypes.ActiveSkills], true);

            if (CharacterScreenIdentifier.SkillTypes.PassiveSkills in _brother)
                this.addSkills(this.mSkills.PassiveSkillsRow, _brother[CharacterScreenIdentifier.Entity.Id], _brother[CharacterScreenIdentifier.SkillTypes.PassiveSkills], false);

            if (CharacterScreenIdentifier.SkillTypes.StatusEffects in _brother)
                this.addSkills(this.mSkills.StatusEffectsRow, _brother[CharacterScreenIdentifier.Entity.Id], _brother[CharacterScreenIdentifier.SkillTypes.StatusEffects], false);
        }
        break;

    default:
        this.mTitleContainer.html('Stats');
        if (_brother !== undefined && CharacterScreenIdentifier.Entity.Stats in _brother)
            this.setProgressbarValues(_brother[CharacterScreenIdentifier.Entity.Stats]);
    }
};

StrongholdPokebroPcDialogModule.prototype.setPortraitImage = function(_imagePath)
{
    if (this.mPortrait.Image.attr('src') == Path.PROCEDURAL + _imagePath)
        return;

    this.mPortrait.Placeholder.removeClass('opacity-almost-none');
    this.mPortrait.Image.attr('src', Path.PROCEDURAL + _imagePath);
};

StrongholdPokebroPcDialogModule.prototype.addSkills = function (_parentDiv, _brotherId, _data, _isSkill)
{
    var self = this;

    _parentDiv.empty();
    jQuery.each(CharacterScreenIdentifier.ItemSlot, function (_index, _value)
    {
        if (_value in _data)
        {
            self.addSkillsDIV(_parentDiv, _brotherId, _data[_value], _isSkill);
        }
    });
};

StrongholdPokebroPcDialogModule.prototype.setProgressbarValues = function (_data)
{
    this.setProgressbarValue(this.mStatsRows.Hitpoints.Progressbar, _data, ProgressbarValueIdentifier.Hitpoints, ProgressbarValueIdentifier.HitpointsMax, ProgressbarValueIdentifier.HitpointsLabel);
    this.setProgressbarValue(this.mStatsRows.Fatigue.Progressbar, _data, ProgressbarValueIdentifier.Fatigue, ProgressbarValueIdentifier.FatigueMax, ProgressbarValueIdentifier.FatigueLabel);
    this.setProgressbarValue(this.mStatsRows.Bravery.Progressbar, _data, ProgressbarValueIdentifier.Bravery, ProgressbarValueIdentifier.BraveryMax, ProgressbarValueIdentifier.BraveryLabel);
    this.setProgressbarValue(this.mStatsRows.Initiative.Progressbar, _data, ProgressbarValueIdentifier.Initiative, ProgressbarValueIdentifier.InitiativeMax, ProgressbarValueIdentifier.InitiativeLabel);
    this.setProgressbarValue(this.mStatsRows.MeleeSkill.Progressbar, _data, ProgressbarValueIdentifier.MeleeSkill, ProgressbarValueIdentifier.MeleeSkillMax, ProgressbarValueIdentifier.MeleeSkillLabel);
    this.setProgressbarValue(this.mStatsRows.RangeSkill.Progressbar, _data, ProgressbarValueIdentifier.RangeSkill, ProgressbarValueIdentifier.RangeSkillMax, ProgressbarValueIdentifier.RangeSkillLabel);
    this.setProgressbarValue(this.mStatsRows.MeleeDefense.Progressbar, _data, ProgressbarValueIdentifier.MeleeDefense, ProgressbarValueIdentifier.MeleeDefenseMax, ProgressbarValueIdentifier.MeleeDefenseLabel);
    this.setProgressbarValue(this.mStatsRows.RangeDefense.Progressbar, _data, ProgressbarValueIdentifier.RangeDefense, ProgressbarValueIdentifier.RangeDefenseMax, ProgressbarValueIdentifier.RangeDefenseLabel);

    this.setTalentValue(this.mStatsRows.Hitpoints, _data.hitpointsTalent);
    this.setTalentValue(this.mStatsRows.Fatigue, _data.fatigueTalent);
    this.setTalentValue(this.mStatsRows.Bravery, _data.braveryTalent);
    this.setTalentValue(this.mStatsRows.Initiative, _data.initiativeTalent);
    this.setTalentValue(this.mStatsRows.MeleeSkill, _data.meleeSkillTalent);
    this.setTalentValue(this.mStatsRows.RangeSkill, _data.rangeSkillTalent);
    this.setTalentValue(this.mStatsRows.MeleeDefense, _data.meleeDefenseTalent);
    this.setTalentValue(this.mStatsRows.RangeDefense, _data.rangeDefenseTalent);
};

StrongholdPokebroPcDialogModule.prototype.updateNameAndTitle = function(_dialog, _brotherId, _tag)
{
    var self = this;
    var contentContainer = _dialog.findPopupDialogContentContainer();
    var parent = _tag === ModRosterOwner.Player ? this.mPlayer : this.mStronghold;
    var inputFields = contentContainer.find('input');
    var name = $(inputFields[0]).getInputText();
    var title = $(inputFields[1]).getInputText();
    
    if (_brotherId === null)
    {
        console.error('ERROR: Failed to update name & title. No entity selected.');
        return;
    }

    this.notifyBackendUpdateNameAndTitle(_brotherId, name, title, _tag, function(data)
    {
        if (data === undefined || data === null || typeof (data) !== 'object')
        {
            console.error('ERROR: Failed to update name & title. Invalid data result.');
            return;
        }
        
        var find = self.getBrotherByID(_brotherId);

        if (find.Index !== null)
        {
            parent.BrothersList[find.Index] = data;

            if (self.mToggledType === ToggleScroll.Type.Portrait)
                self.updateDetailsPanel(data);
        }
        else
        {
            console.error('ERROR: Failed to update name & title. Can not update new name to current database.');
        }
    });
};


StrongholdPokebroPcDialogModule.prototype.transferItemsToStash = function ( _type )
{
    var self = this;
    var brother = this.getBrotherByIndex(this.mSelectedBrother.Index, this.mSelectedBrother.Tag);

    if (brother === null || brother === undefined)
        return;

    this.notifyBackendCheckCanTransferItems(brother[CharacterScreenIdentifier.Entity.Id], _type, this.mSelectedBrother.Tag, function(data)
    {
        if (data === undefined || data === null || typeof (data) !== 'object')
        {
            console.error('ERROR: Failed to find the brother to transferItemsToStash. Invalid data result.');
            return;
        }

        if ('NoItem' in data)
            return;
        
        if (data.Result === true)
        {
            self.notifyBackendTransferItems();
        }
        else
        {
            self.openTransferConfirmationPopupDialog(data);
        }
    });
};


StrongholdPokebroPcDialogModule.prototype.updateRosterLabel = function ()
{
    //useless for now
};
//-----------------------------------


//- Call Squirrel backend function
StrongholdPokebroPcDialogModule.prototype.notifyBackendModuleShown = function ()
{
    SQ.call(this.mSQHandle, 'onModuleShown');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendModuleHidden = function ()
{
    SQ.call(this.mSQHandle, 'onModuleHidden');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendModuleAnimating = function ()
{
    SQ.call(this.mSQHandle, 'onModuleAnimating');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendLeaveButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onLeaveButtonPressed');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendBrothersButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onBrothersButtonPressed');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendTooltipButtonPressed = function (_data)
{
    SQ.call(this.mSQHandle, 'onTooltipButtonPressed', [_data]);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendTransferItems = function ()
{
    SQ.call(this.mSQHandle, 'onTransferItems');
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendCheckCanTransferItems = function (_brotherId, _type, _tag, _callback)
{
    SQ.call(this.mSQHandle, 'onCheckCanTransferItems', [_brotherId, _type, _tag], _callback);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendUpdateNameAndTitle = function (_brotherId, _name, _title, _tag, _callback)
{
    SQ.call(this.mSQHandle, 'onUpdateNameAndTitle', [_brotherId, _name, _title, _tag], _callback);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendPopupDialogIsVisible = function (_visible)
{
    SQ.call(this.mSQHandle, 'onPopupDialogIsVisible', [_visible]);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendDismissCharacter = function (_payCompensation, _brotherId, _tag)
{
    SQ.call(this.mSQHandle, 'onDismissCharacter', [ _brotherId, _payCompensation, _tag ]);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendUpdateRosterPosition = function (_id, _pos)
{
    SQ.call(this.mSQHandle, 'onUpdateRosterPosition', [ _id, _pos ]);
};

StrongholdPokebroPcDialogModule.prototype.notifyBackendMoveAtoB = function (_id, _tagA, _pos, _tagB)
{
    SQ.call(this.mSQHandle, 'MoveAtoB', [ _id, _tagA, _pos, _tagB ]);
};
//----------------------------------------------------------------------------------------


// Add a utility function to create a more customized list
$.fn.createListWithCustomOption = function(_options, _classes,_withoutFrame)
 {
    var result = $('<div class="ui-control list has-frame"/>');
    if (_withoutFrame !== undefined && _withoutFrame === true)
    {
        result.removeClass('has-frame');
    }

    if (_classes !== undefined && _classes !== null && typeof(_classes) === 'string')
    {
        result.addClass(_classes);
    }

    var scrollContainer = $('<div class="scroll-container"/>');
    result.append(scrollContainer);

    this.append(result);

    if (_options.delta === null || _options.delta === undefined)
    {
        _options.delta = 8;
    }

    // NOTE: create scrollbar (must be after the list was appended to the DOM!)
    result.aciScrollBar(_options);
    return result;
};


// HOOK TIME
var w_onDisconnection = WorldTownScreen.prototype.onDisconnection;
WorldTownScreen.prototype.onDisconnection = function ()
{
    this.mPokebroPcDialogModule.onDisconnection();
    w_onDisconnection.call(this);
};

var w_onModuleOnConnectionCalled = WorldTownScreen.prototype.onModuleOnConnectionCalled;
WorldTownScreen.prototype.onModuleOnConnectionCalled = function (_module)
{
    if (this.mPokebroPcDialogModule !== null && this.mPokebroPcDialogModule.isConnected())
    {
        w_onModuleOnConnectionCalled.call(this);
    }
};

var w_onModuleOnDisconnectionCalled = WorldTownScreen.prototype.onModuleOnDisconnectionCalled;
WorldTownScreen.prototype.onModuleOnDisconnectionCalled = function (_module)
{
    if (this.mPokebroPcDialogModule !== null && !this.mPokebroPcDialogModule.isConnected())
    {
        w_onModuleOnDisconnectionCalled.call(this);
    }
};

var w_unregisterModules = WorldTownScreen.prototype.unregisterModules;
WorldTownScreen.prototype.unregisterModules = function ()
{
    this.mPokebroPcDialogModule.unregister();
    w_unregisterModules.call(this);
};

var w_createModules = WorldTownScreen.prototype.createModules;
WorldTownScreen.prototype.createModules = function()
{
    var self = this;
    w_createModules.call(this);

    if (!('mPokebroPcDialogModule' in self))
    {
        self.mPokebroPcDialogModule = null;
        this.mPokebroPcDialogModule = new StrongholdPokebroPcDialogModule(this);
    }
};
w_createModules.call(WorldTownScreen);

var w_registerModules = WorldTownScreen.prototype.registerModules;
w_registerModules.call(WorldTownScreen);
WorldTownScreen.prototype.registerModules = function ()
{
    var self = this;

    if (!('mPokebroPcDialogModule' in self))
    {
        self.mPokebroPcDialogModule = null;
        this.mPokebroPcDialogModule = new StrongholdPokebroPcDialogModule(this);
    }

    this.mPokebroPcDialogModule.register(this.mContainer);
    w_registerModules.call(this);
};

var w_getModule = WorldTownScreen.prototype.getModule;
WorldTownScreen.prototype.getModule = function (_name)
{
    if (_name === 'StrongholdPokebroPcDialogModule') {
        return this.mPokebroPcDialogModule;
    }

    var result = w_getModule.call(this, _name);
    return result;
};

var w_getModules = WorldTownScreen.prototype.getModules;
WorldTownScreen.prototype.getModules = function ()
{
    var result = w_getModules.call(this);
    result.push({name: 'StrongholdPokebroPcDialogModule', module: this.mPokebroPcDialogModule});
    return result;
};

// add new function to show the new module
WorldTownScreen.prototype.showPokebroPcDialog = function (_data)
{
    var _withSlideAnimation = true;

    this.mContainer.addClass('display-block').removeClass('display-none');

    if (this.mActiveModule != null)
        this.mActiveModule.hide(_withSlideAnimation);
    else
        this.mMainDialogModule.hide();

    this.mActiveModule = this.mPokebroPcDialogModule;

    if (_data !== undefined && _data !== null && typeof (_data) === 'object')
    {
        //this.loadAssetData(_data.Assets);
        this.mPokebroPcDialogModule.loadFromData(_data);
    }

    this.mPokebroPcDialogModule.show(_withSlideAnimation);
};


// make a clickable situation icon by overriding the existing function, save my time from adding a new button lol 
WorldTownScreenMainDialogModule.prototype.createEffect = function (_data, _i, _content)
{
    if (_data == null)
    {
        return;
    }

    var self = this;
    var classes = 'display-block is-status-effect effect' + _i;

    var effect = _content.createImage(Path.GFX + _data.Icon, null, null, classes);
    effect.bindTooltip({ contentType: 'settlement-status-effect', statusEffectId: _data.ID });

    // lol who need a button when you can just make something clickable
    if (_data.ID == 'POKEBRO')
    {
        effect.click(function (_event)
        {
            self.mParent.notifyBackendContractClicked(_data.ID);
        });

        effect.mouseover(function()
        {
            this.classList.add('is-highlighted');
            effect.attr('src', Path.GFX + _data.Icon + '_b.png');
        });
        effect.mouseout(function()
        {
            this.classList.remove('is-highlighted');
            effect.attr('src', Path.GFX + _data.Icon);
        });
    }
};