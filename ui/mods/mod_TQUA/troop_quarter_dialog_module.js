"use strict";

// identifier for roster tag
var Owner =
{
    Quarter: 'quarter',
    Player: 'player'
};

var TroopQuarterDialogModule = function(_parent)
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

    // stuffs
    this.mSelectedBrother =
    {
        Index : 0,
        Tag   : null
    };

    // button bar
    this.mButtonBarContainer           = null;
    this.mPlayerBrotherButton          = null;

    this.mTroopQuarter = new BrotherContainer(Owner.Quarter);
    this.mTroopQuarter.mBrotherCurrent = 0;
    this.mTroopQuarter.mBrotherMin = 0;
    this.mTroopQuarter.mBrotherMax = 2;
    this.mTroopQuarter.mSlotLimit = 44;
    this.mTroopQuarter.BrotherList = null;
    this.mTroopQuarter.ListContainer = null;
    this.mTroopQuarter.ListScrollContainer = null;

    this.mPlayerRoster = new BrotherContainer(Owner.Player);
    this.mPlayerRoster.mBrotherCurrent = 0;
    this.mPlayerRoster.mBrotherMin = 1;
    this.mPlayerRoster.mBrotherMax = 5;
    this.mPlayerRoster.mSlotLimit = 27;
    this.mPlayerRoster.BrotherList = null;
    this.mPlayerRoster.ListContainer = null;
    this.mPlayerRoster.ListScrollContainer = null;

    // buttons
    this.mLeaveButton     = null;

    // generics
    this.mIsVisible       = false;
};

TroopQuarterDialogModule.prototype.getRoster = function ( _rosterID )
{
    if (_rosterID === Owner.Player) return this.mPlayerRoster;
    if (_rosterID === Owner.Quarter) return this.mTroopQuarter;
    console.error(_rosterID + " is no valid roster id");
    return null;
}

TroopQuarterDialogModule.prototype.createDIV = function (_parentDiv)
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
    this.mTroopQuarter.ListContainer = listContainerLayout.createListWithCustomOption({
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
    this.mTroopQuarter.ListScrollContainer = this.mTroopQuarter.ListContainer.findListScrollContainer();
    this.createBrotherSlots(Owner.Quarter);



    //-2 mid row
    var row = $('<div class="middle-row"/>');
    column.append(row);

    // buttons bar
    this.mButtonBarContainer = $('<div class="is-right"/>');
    row.append(this.mButtonBarContainer);
    var panelLayout = $('<div class="button-panel"/>');
    this.mButtonBarContainer.append(panelLayout);

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

    // player roster
    var detailFrame = $('<div class="background-frame-container"/>');
    row.append(detailFrame);
    this.mPlayerRoster.ListScrollContainer = $('<div class="l-list-container"/>');
    detailFrame.append(this.mPlayerRoster.ListScrollContainer);
    this.createBrotherSlots(Owner.Player);


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


TroopQuarterDialogModule.prototype.destroyDIV = function ()
{
    this.mAssets.destroyDIV();;

    this.mLeaveButton.remove();
    this.mLeaveButton = null;

    this.mButtonBarContainer.remove();
    this.mButtonBarContainer = null;

    this.mTroopQuarter.ListScrollContainer.empty();
    this.mTroopQuarter.ListScrollContainer = null;
    this.mTroopQuarter.ListContainer.destroyList();
    this.mTroopQuarter.ListContainer.remove();
    this.mTroopQuarter.ListContainer = null;

    this.mPlayerRoster.ListScrollContainer.empty();
    this.mPlayerRoster.ListScrollContainer = null;

    this.mDialogContainer.empty();
    this.mDialogContainer.remove();
    this.mDialogContainer = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


TroopQuarterDialogModule.prototype.bindTooltips = function ()
{
    this.mAssets.bindTooltips();
    this.mAssets.mBrothersAsset.unbindTooltip();

    // replace with a new tooltip to tell player it's for displaying stronghold roster size
    this.mAssets.mBrothersAsset.bindTooltip({ contentType: 'ui-element', elementId: 'assets.BrothersInStronghold' });


    this.mLeaveButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.WorldTownScreen.HireDialogModule.LeaveButton });
};


TroopQuarterDialogModule.prototype.unbindTooltips = function ()
{
    this.mAssets.unbindTooltips();

    this.mLeaveButton.unbindTooltip();
};


// generic stuff for a module
TroopQuarterDialogModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};
TroopQuarterDialogModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};
TroopQuarterDialogModule.prototype.register = function (_parentDiv)
{
    console.log('TroopQuarterDialogModule::REGISTER');

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
TroopQuarterDialogModule.prototype.unregister = function ()
{
    console.log('TroopQuarterDialogModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister World Stronghold Pokemon PC Dialog Module. Reason: World Stronghold Pokemon PC Dialog Module is not initialized.');
        return;
    }

    this.destroy();
};
TroopQuarterDialogModule.prototype.isRegistered = function ()
{
    if (this.mContainer !== null)
    {
        return this.mContainer.parent().length !== 0;
    }

    return false;
};
TroopQuarterDialogModule.prototype.registerEventListener = function(_listener)
{
    this.mEventListener = _listener;
};
TroopQuarterDialogModule.prototype.show = function (_withSlideAnimation)
{
    var self = this;

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
TroopQuarterDialogModule.prototype.hide = function ()
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
TroopQuarterDialogModule.prototype.isVisible = function ()
{
    return this.mIsVisible;
};
//--------------------------------------------------------


// Load the Data
TroopQuarterDialogModule.prototype.loadFromData = function (_data)
{
    if(_data === undefined || _data === null)       return;

    if('Title' in _data && _data.Title !== null)                this.mDialogContainer.findDialogTitle().html(_data.Title);
    if('SubTitle' in _data && _data.SubTitle !== null)          this.mDialogContainer.findDialogSubTitle().html(_data.SubTitle);

    if ('PlayerMin' in _data && _data.PlayerMin !== null)               this.mPlayerRoster.mBrotherMin = _data.PlayerMin;
    if ('PlayerMax' in _data && _data.PlayerMax !== null)               this.mPlayerRoster.mBrotherMax = _data.PlayerMax;
    if ('PlayerSlotLimit' in _data && _data.PlayerSlotLimit !== null)   this.mPlayerRoster.mSlotLimit = _data.PlayerSlotLimit;

    if ('QuarterMin' in _data && _data.QuarterMin !== null)             this.mTroopQuarter.mBrotherMin = _data.QuarterMin;
    if ('QuarterMax' in _data && _data.QuarterMax !== null)             this.mTroopQuarter.mBrotherMax = _data.QuarterMax;
    if ('QuarterSlotLimit' in _data && _data.QuarterSlotLimit !== null)
    {
        this.mTroopQuarter.mSlotLimit = _data.QuarterSlotLimit;

        if (this.mTroopQuarter.Slots.length < this.mTroopQuarter.mSlotLimit)
        {
            this.mTroopQuarter.ListScrollContainer.empty();
            this.createBrotherSlots(Owner.Quarter);
        }
    }

    if ('Stronghold' in _data && _data.Stronghold !== null)
    {
        this.mTroopQuarter.BrotherList = _data.Stronghold;
        this.onBrothersListLoaded(Owner.Quarter);
    }

    if ('Player' in _data && _data.Player !== null)
    {
        this.mPlayerRoster.BrotherList = _data.Player;
        this.onBrothersListLoaded(Owner.Player);

        // automatically select the first brother in player roster
        for (var i = 0; i < _data.Player.length; i++)
        {
            var brother = _data.Player[i];

            if (brother !== null)
            {
                this.setBrotherSelected(i, Owner.Player, true);
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

TroopQuarterDialogModule.prototype.getNumBrothers = function (_brothersList)
{
    var num = 0;

    for (var i = 0; i != _brothersList.length; ++i)
    {
        if(_brothersList[i] !== null)
            ++num;
    }

    return num;
};

TroopQuarterDialogModule.prototype.getIndexOfFirstEmptySlot = function (_slots)
{
    for (var i = 0; i < _slots.length; i++)
    {
        if (_slots[i].data('child') == null)
        {
            return i;
        }
    }
}

TroopQuarterDialogModule.prototype.setBrotherSelected = function (_rosterPosition, _rosterTag, _withoutNotify)
{
    var brother = this.getBrotherByIndex(_rosterPosition, _rosterTag);

    if (brother === null || brother === undefined)
        return;

    this.mSelectedBrother.Index = _rosterPosition;
    this.mSelectedBrother.Tag = _rosterTag;
    this.removeCurrentBrotherSlotSelection();
    this.selectBrotherSlot(brother[CharacterScreenIdentifier.Entity.Id]);

    // notify update
    if (_withoutNotify === undefined || _withoutNotify !== true)
    {
        var parent = this.getRoster(_rosterTag);
        this.onBrothersListLoaded(_rosterTag);
    }
};

TroopQuarterDialogModule.prototype.getBrotherByIndex = function (_index, _tag)
{
    var owner = this.getRoster(_tag);
    if (_index < owner.BrotherList.length) return owner.BrotherList[_index];

    return null;
};


TroopQuarterDialogModule.prototype.getBrotherByID = function (_brotherId)
{
    var data =
    {
        Index   : null,
        Tag     : null,
        Brother : null,
    };

    // find selected one
    if (this.mPlayerRoster.BrotherList !== null && jQuery.isArray(this.mPlayerRoster.BrotherList))
    {
        for (var i = 0; i < this.mPlayerRoster.BrotherList.length; ++i)
        {
            var brother = this.mPlayerRoster.BrotherList[i];

            if (brother != null && CharacterScreenIdentifier.Entity.Id in brother && brother[CharacterScreenIdentifier.Entity.Id] === _brotherId)
            {
                data.Index = i;
                data.Tag = Owner.Player;
                data.Brother = brother;
                return data;
            }
        }
    }

    if (this.mTroopQuarter.BrotherList !== null && jQuery.isArray(this.mTroopQuarter.BrotherList))
    {
        for (var i = 0; i < this.mTroopQuarter.BrotherList.length; ++i)
        {
            var brother = this.mTroopQuarter.BrotherList[i];

            if (brother !== null && CharacterScreenIdentifier.Entity.Id in brother && brother[CharacterScreenIdentifier.Entity.Id] === _brotherId)
            {
                data.Index = i;
                data.Tag = Owner.Quarter;
                data.Brother = brother;
                return data;
            }
        }
    }

    return data;
};

TroopQuarterDialogModule.prototype.setBrotherSelectedByID = function (_brotherId)
{
    var data = this.getBrotherByID(_brotherId);

    if (data.Index !== null && data.Tag !== null)
    {
        this.mSelectedBrother.Index = data.Index;
        this.mSelectedBrother.Tag = data.Tag;
        this.removeCurrentBrotherSlotSelection();
        this.selectBrotherSlot(_brotherId);
    }
};


TroopQuarterDialogModule.prototype.removeCurrentBrotherSlotSelection = function ()
{
    this.mTroopQuarter.ListScrollContainer.find('.is-selected').each(function (index, element)
    {
        var slot = $(element);
        slot.removeClass('is-selected');
    });
    this.mPlayerRoster.ListScrollContainer.find('.is-selected').each(function (index, element)
    {
        var slot = $(element);
        slot.removeClass('is-selected');
    });
};


TroopQuarterDialogModule.prototype.selectBrotherSlot = function (_brotherId)
{
    var listScrollContainer = this.mSelectedBrother.Tag == Owner.Player ? this.mPlayerRoster.ListScrollContainer : this.mTroopQuarter.ListScrollContainer;
    var slot = listScrollContainer.find('#slot-index_' + _brotherId + ':first');
    if (slot.length > 0)
    {
        slot.addClass('is-selected');
    }
};


// move brother to the other roster on right-click
TroopQuarterDialogModule.prototype.quickMoveBrother = function (_source)
{
    var _brother = _source.data('brother');

    // check if both roster is full
    if (this.mTroopQuarter.mBrotherCurrent === this.mTroopQuarter.mBrotherMax && this.mPlayerRoster.mBrotherCurrent === this.mPlayerRoster.mBrotherMax)
    {
        return false;
    }

    var data = this.getBrotherByID(_brother[CharacterScreenIdentifier.Entity.Id]);

    if (data.Index === null || data.Tag === null)
    {
        return false;
    }

    // selected brother is in player roster
    if (data.Tag === Owner.Player)
    {
        // deny when the selected brother is a player character
        if (_source.data('player') === true)
            return false;

        // deny when player roster only has 1 bro
        if (this.mPlayerRoster.mBrotherCurrent === this.mPlayerRoster.mBrotherMin)
            return false;

        // deny when stronghold roster is full
        if (this.mTroopQuarter.mBrotherCurrent === this.mTroopQuarter.mBrotherMax)
            return false;

        // transfer brother from player roster to stronghold roster
        var firstEmptySlot = this.getIndexOfFirstEmptySlot(this.mTroopQuarter.Slots);
        this.swapSlots(data.Index, Owner.Player, firstEmptySlot, Owner.Quarter);
    }
    // selected brother is in stronghold roster
    else
    {
        // deny when player roster has reached brothers max
        if (this.mPlayerRoster.mBrotherCurrent >= this.mPlayerRoster.mBrotherLimit)
            return false;

        // deny when player roster is full
        if (this.mPlayerRoster.mBrotherCurrent === this.mPlayerRoster.mBrotherMax)
            return false;

        // transfer brother from stronghold roster to player roster
        var firstEmptySlot = this.getIndexOfFirstEmptySlot(this.mPlayerRoster.Slots);
        this.swapSlots(data.Index, Owner.Quarter, firstEmptySlot, Owner.Player);
    }

    return true;
};


// swap the brother data so i don't have to update the whole roster
TroopQuarterDialogModule.prototype.swapBrothers = function (_sourceIdx, _sourceOwner, _targetIdx, _targetOwner)
{
    var tmp = _sourceOwner.BrotherList[_sourceIdx];
    _sourceOwner.BrotherList[_sourceIdx] = _targetOwner.BrotherList[_targetIdx];
    _targetOwner.BrotherList[_targetIdx] = tmp;
}


TroopQuarterDialogModule.prototype.swapSlots = function (_a, _tagA, _b, _tagB)
{
    var isDifferenceRoster = _tagA != _tagB;
    var sourceOwner = this.getRoster(_tagA);
    var targetOwner = this.getRoster(_tagB);
    var slotA = sourceOwner.Slots[_a];
    var slotB = targetOwner.Slots[_b];

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
            --sourceOwner.mBrotherCurrent;
            ++targetOwner.mBrotherCurrent;
            this.notifyBackendMoveAtoB(A.data('ID'), _tagA, _b, _tagB);
        }
        else
        {
            this.notifyBackendRelocateBrother(A.data('ID'), _b);
        }

        this.swapBrothers(_a, sourceOwner, _b, targetOwner);

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
            this.notifyBackendRelocateBrother(A.data('ID'), _b);
            this.notifyBackendRelocateBrother(B.data('ID'), _a);
        }

        this.swapBrothers(_a, sourceOwner, _b, targetOwner);

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
TroopQuarterDialogModule.prototype.createBrotherSlots = function ( _tag )
{
    var self = this;
    var isPlayer = _tag === Owner.Player;

    var parent = this.getRoster (_tag);
    parent.Slots = [];

    for (var i = 0 ; i < parent.mSlotLimit; i++)
    {
        parent.Slots.push(null);
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
            if (drag.data('tag') === Owner.Quarter && self.mPlayerRoster.mBrotherCurrent >= self.mPlayerRoster.mBrotherMax)
                return false;
        }

        // number in formation is limited
        if (parent.mBrotherCurrent >= parent.mBrotherMax && drag.data('idx') > parent.mBrotherMax && drop.data('idx') <= parent.mBrotherMax && parent.Slots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // always keep at least 1 in formation
        if (parent.mBrotherCurrent == parent.mBrotherMin && drag.data('idx') <= parent.mBrotherMax && drop.data('idx') > parent.mBrotherMax && parent.Slots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // do the swapping
        self.swapSlots(drag.data('idx'), drag.data('tag'), drop.data('idx'), drop.data('tag'));
    };

    for (var i = 0; i < parent.Slots.length; ++i)
    {
        if (isPlayer)
        parent.Slots[i] = $('<div class="ui-control is-brother-slot is-roster-slot"/>');
        else
        parent.Slots[i] = $('<div class="ui-control is-brother-slot is-reserve-slot"/>');

        parent.ListScrollContainer.append(parent.Slots[i]);

        parent.Slots[i].data('idx', i);
        parent.Slots[i].data('tag', _tag);
        parent.Slots[i].data('child', null);
        parent.Slots[i].drop("end", dropHandler);
    }
};
// add brother to empty slot
TroopQuarterDialogModule.prototype.addBrotherSlotDIV = function(_parent, _data, _index, _tag)
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
    ++_parent.mBrotherCurrent;

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


TroopQuarterDialogModule.prototype.onBrothersListLoaded = function (_tag)
{
    var parent = this.getRoster(_tag);
    for(var i = 0; i != parent.Slots.length; ++i)
    {
        parent.Slots[i].empty();
        parent.Slots[i].data('child', null);
    }

    parent.mBrotherCurrent = 0;

    if (parent.BrotherList === null || !jQuery.isArray(parent.BrotherList) || parent.BrotherList.length === 0)
    {
        return;
    }

    for (var i = 0; i < parent.BrotherList.length; ++i)
    {
        var brother = parent.BrotherList[i];

        if (brother !== null)
        {
            this.addBrotherSlotDIV(parent, brother, i, _tag);
        }
    }

    //this.updateRosterLabel();
};


//- Update some shits
TroopQuarterDialogModule.prototype.updateAssets = function (_data)
{
    var value = null;
    var maxValue = null;
    var previousValue = null;
    var valueDifference = null;
    var currentAssetInformation = _data;
    var previousAssetInformation = this.mRoster;

    if ('PlayerCurrent' in _data && 'PlayerMax' in _data)
    {
        value = currentAssetInformation['PlayerCurrent'];
        maxValue = currentAssetInformation['PlayerMax'];
        previousValue = previousAssetInformation['PlayerCurrent'];
        valueDifference = value - previousValue;

        this.updateAssetValue(this.mPlayerBrotherButton, value, maxValue, valueDifference);
    }

    if ('QuarterCurrent' in _data && 'QuarterMax' in _data)
    {
        value = currentAssetInformation['QuarterCurrent'];
        maxValue = currentAssetInformation['QuarterMax'] > this.mTroopQuarter.mBrotherMax ? this.mTroopQuarter.mBrotherMax : currentAssetInformation['QuarterMax'];
        previousValue = previousAssetInformation['QuarterCurrent'];
        valueDifference = value - previousValue;

        this.updateAssetValue(this.mAssets.mBrothersAsset, value, maxValue, valueDifference);
    }
}

TroopQuarterDialogModule.prototype.updateAssetValue = function (_container, _value, _valueMax, _valueDifference)
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
TroopQuarterDialogModule.prototype.updateSelectedBrother = function (_data)
{
    if (_data === undefined || _data === null || typeof (_data) !== 'object')
    {
        console.error('ERROR: Failed to update selected brother. Invalid data result.');
        return;
    }

    var index = this.mSelectedBrother.Index;
    var tag = this.mSelectedBrother.Tag;
    var parent = this.getRoster(tag)
    parent.BrotherList[index] = _data;
    parent.Slots[index].empty();
    parent.Slots[index].data('child', null);
    this.addBrotherSlotDIV(parent, _data, index, tag);
}

//- Call Squirrel backend function
TroopQuarterDialogModule.prototype.notifyBackendModuleShown = function ()
{
    SQ.call(this.mSQHandle, 'onModuleShown');
};

TroopQuarterDialogModule.prototype.notifyBackendModuleHidden = function ()
{
    SQ.call(this.mSQHandle, 'onModuleHidden');
};

TroopQuarterDialogModule.prototype.notifyBackendModuleAnimating = function ()
{
    SQ.call(this.mSQHandle, 'onModuleAnimating');
};

TroopQuarterDialogModule.prototype.notifyBackendLeaveButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onLeaveButtonPressed');
};

TroopQuarterDialogModule.prototype.notifyBackendBrothersButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onBrothersButtonPressed');
};

TroopQuarterDialogModule.prototype.notifyBackendTooltipButtonPressed = function (_data)
{
    SQ.call(this.mSQHandle, 'onTooltipButtonPressed', [_data]);
};

TroopQuarterDialogModule.prototype.notifyBackendCheckCanTransferItems = function (_brotherId, _type, _tag, _callback)
{
    SQ.call(this.mSQHandle, 'onCheckCanTransferItems', [_brotherId, _type, _tag], _callback);
};

TroopQuarterDialogModule.prototype.notifyBackendUpdateNameAndTitle = function (_brotherId, _name, _title, _tag, _callback)
{
    SQ.call(this.mSQHandle, 'onUpdateNameAndTitle', [_brotherId, _name, _title, _tag], _callback);
};

TroopQuarterDialogModule.prototype.notifyBackendPopupDialogIsVisible = function (_visible)
{
    SQ.call(this.mSQHandle, 'onPopupDialogIsVisible', [_visible]);
};

TroopQuarterDialogModule.prototype.notifyBackendRelocateBrother = function (_brotherID, _placeInFormation)
{
    SQ.call(this.mSQHandle, 'onRelocateBrother', [ _brotherID, _placeInFormation ]);
};

TroopQuarterDialogModule.prototype.notifyBackendMoveAtoB = function (_id, _tagA, _pos, _tagB)
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


TroopQuarterDialogModule.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};

TroopQuarterDialogModule.prototype.onConnection = function (_handle)
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

TroopQuarterDialogModule.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnDisconnectionCalled(this);
    }
};
