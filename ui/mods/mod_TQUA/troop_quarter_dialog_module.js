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

    // button bar
    this.mButtonBarContainer           = null;
    this.mPlayerBrotherButton          = null;

    this.mTroopQuarter = new BrotherContainer(Owner.Quarter);
    this.mTroopQuarter.mBrotherCurrent = 0;
    this.mTroopQuarter.mBrotherMin = 0;
    this.mTroopQuarter.mBrotherMax = 2;
    this.mTroopQuarter.mSlotLimit = 44;
    this.mTroopQuarter.mBrotherList = null;
    this.mTroopQuarter.ListContainer = null;
    this.mTroopQuarter.ListScrollContainer = null;

    this.mPlayerRoster = new BrotherContainer(Owner.Player);
    this.mPlayerRoster.mBrotherCurrent = 0;
    this.mPlayerRoster.mBrotherMin = 1;
    this.mPlayerRoster.mBrotherMax = 5;
    this.mPlayerRoster.mSlotLimit = 27;
    this.mPlayerRoster.mBrotherList = null;
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
//--------------------------------------------------------


// Load the Data
TroopQuarterDialogModule.prototype.loadFromData = function (_data)
{
    if(_data === undefined || _data === null)       return;

    if('Title' in _data && _data.Title !== null)                this.mDialogContainer.findDialogTitle().html(_data.Title);
    if('SubTitle' in _data && _data.SubTitle !== null)          this.mDialogContainer.findDialogSubTitle().html(_data.SubTitle);

    if ('Player' in _data && _data.Player !== null)
    {
        this.mPlayerRoster.loadFromData(_data.Player);

        if ('Roster' in _data.Player && _data.Player.Roster !== null)
        {
            var playerRoster = this.getRoster(Owner.Player);
            this.onBrothersListLoaded(Owner.Player);

            // automatically select the first brother in player roster
            for (var i = 0; i < playerRoster.mBrotherList.length; i++)
            {
                var brother = playerRoster.mBrotherList[i];

                if (brother !== null)
                {
                    playerRoster.selectSlot(i);
                    break;
                }
            }
        }
    }

    if ('Quarter' in _data && _data.Quarter !== null)
    {
        this.mTroopQuarter.loadFromData(_data.Quarter);

        if ('Roster' in _data && _data.Quarter.Roster !== null)
        {
            this.onBrothersListLoaded(Owner.Quarter);
        }

        if ('SlotLimit' in _data && _data.Quarter.SlotLimit !== null)
            if (this.mTroopQuarter.mSlots.length < this.mTroopQuarter.mSlotLimit)
            {
                this.mTroopQuarter.ListScrollContainer.empty();
                this.createBrotherSlots(Owner.Quarter);
            }
    }

    if('Assets' in _data && _data.Assets !== null)
    {
        if (!('No' in _data.Assets))
            this.mRoster = _data.Assets;

        this.updateAssets(_data.Assets);
    }
};

// Returns the slot that is currently selected. This should usually have a brother inside
// Returns null if no slot is selected
TroopQuarterDialogModule.prototype.getSelected = function()
{
    if (this.getRoster(Owner.Player).hasSelected())
    {
        return {
            Index       : this.getRoster(Owner.Player).mSelectedBrother,
            OwnerID     : this.getRoster(Owner.Player).mContainerID,
            Brother     : this.getRoster(Owner.Player).getSelected()
        };
    }

    if (this.getRoster(Owner.Quarter).hasSelected())
    {
        return {
            Index       : this.getRoster(Owner.Quarter).mSelectedBrother,
            OwnerID     : this.getRoster(Owner.Quarter).mContainerID,
            Brother     : this.getRoster(Owner.Quarter).getSelected()
        };
    }

    console.error("getSelected returned null");
    return null;
}

TroopQuarterDialogModule.prototype.setBrotherSelected = function (_rosterPosition, _rosterTag, _withoutNotify)
{
    this.getRoster(Owner.Player).deselectCurrent();
    this.getRoster(Owner.Quarter).deselectCurrent();

    this.getRoster(_rosterTag).selectSlot(_rosterPosition);
/*
    var brother = this.getRoster(_rosterTag).getBrotherByIndex(_rosterPosition)
    if (brother === null || brother === undefined) return;

    if (this.getSelected() !== null) this.getOwner(this.getSelected().OwnerID).deselectCurrent();
    this.setBrotherSelectedByID(brother[CharacterScreenIdentifier.Entity.Id]);
*/
    // notify update
    if (_withoutNotify === undefined || _withoutNotify !== true)
    {
        this.onBrothersListLoaded(_rosterTag);
    }
};

// When we don't know in which roster he is
TroopQuarterDialogModule.prototype.getBrotherByID = function (_brotherID)
{
    var playerBrother = this.getRoster(Owner.Player).getBrotherByID(_brotherID);
    if (playerBrother.IsNull === false) return playerBrother;

    return this.getRoster(Owner.Quarter).getBrotherByID(_brotherID);
};

TroopQuarterDialogModule.prototype.setBrotherSelectedByID = function (_brotherID)
{
    this.getRoster(Owner.Player).deselectCurrent();
    this.getRoster(Owner.Quarter).deselectCurrent();

    if (this.getRoster(Owner.Player).selectBrother(_brotherID)) return true;

    return this.getRoster(Owner.Quarter).selectBrother(_brotherID);
};

// move brother to the other roster on right-click
TroopQuarterDialogModule.prototype.quickMoveBrother = function (_clickedSlot)
{
    var _brother = _clickedSlot.data('brother');

    var data = this.getBrotherByID(_brother[CharacterScreenIdentifier.Entity.Id]);

    if (data.Index === null || data.Tag === null)
    {
        return false;
    }

    // selected brother is in player roster
    var targetOwnerID = Owner.Player;
    if (data.Tag === Owner.Player) targetOwnerID = Owner.Quarter;
    var sourceOwner = this.getRoster(data.Tag);
    var targetOwner = this.getRoster(targetOwnerID);

    if (data.Tag === Owner.Player)
    {
        // deny when the selected brother is a player character
        if (_clickedSlot.data('player') === true) return false;
    }

    // Source roster is at minimum
    if (sourceOwner.mBrotherCurrent <= sourceOwner.mBrotherMin) return false;

    // Targeted Roster is at maximum
    if (targetOwner.mBrotherCurrent >= targetOwner.mBrotherMax) return false;

    // transfer brother from source roster to target roster
    var firstEmptySlot = this.getRoster(targetOwnerID).getIndexOfFirstEmptySlot();
    this.swapSlots(data.Index, data.Tag, firstEmptySlot, targetOwner.mContainerID);

    return true;
};

// swap the brother data so i don't have to update the whole roster
TroopQuarterDialogModule.prototype.swapBrothers = function (_sourceIdx, _sourceOwner, _targetIdx, _targetOwner)
{
    var tmp = _sourceOwner.mBrotherList[_sourceIdx];
    _sourceOwner.mBrotherList[_sourceIdx] = _targetOwner.mBrotherList[_targetIdx];
    _targetOwner.mBrotherList[_targetIdx] = tmp;
}

// Removes a brother from one brotherContainer and puts them into a different brotherContainer
// _sourceIdx is an unsigned integer
// _targetIdx is an unsigned integer
// _sourceOwner, _targetOwner are BrotherContainer and not null
TroopQuarterDialogModule.prototype.transferBrother = function ( _sourceIdx, _sourceOwnerID, _targetIdx, _targetOwnerID )
{
    var sourceOwner = this.getRoster(_sourceOwnerID);
    var targetOwner = this.getRoster(_targetOwnerID);

    // Source roster is at minimum
    if (sourceOwner.mBrotherCurrent <= sourceOwner.mBrotherMin) return false;

    // Targeted Roster is at maximum
    if (targetOwner.mBrotherCurrent >= targetOwner.mBrotherMax) return false;

    var brotherID = sourceOwner.mSlots[_sourceIdx].data('child').data('ID');

    var brotherData = sourceOwner.removeBrother(_sourceIdx);
    targetOwner.insertBrother(_targetIdx, brotherData);

    this.notifyBackendMoveAtoB(brotherID, _sourceOwnerID, _targetIdx, _targetOwnerID);

    return true;
}

// Swap the contents of two slots no matter where they are or what their state is
TroopQuarterDialogModule.prototype.swapSlots = function (_firstIdx, _tagA, _secondIdx, _tagB)
{
    if (_firstIdx === null || _secondIdx === null) return false;
    var sourceOwner = this.getRoster(_tagA);
    var targetOwner = this.getRoster(_tagB);
    if (sourceOwner.isEmpty(_firstIdx) && targetOwner.isEmpty(_secondIdx)) return false;

    var slotA = sourceOwner.mSlots[_firstIdx];
    var slotB = targetOwner.mSlots[_secondIdx];

    if (_tagA === _tagB)
    {
        if(slotB.data('child') === null)
        {
            var sourceBrotherID = slotA.data('child').data('ID');
            if (this.getRoster(_tagA).swapSlots(_firstIdx, _secondIdx) === false) return false
            this.notifyBackendRelocateBrother(sourceBrotherID, _secondIdx);
        }
        else
        {
            var sourceBrotherID = slotA.data('child').data('ID');
            var targetBrotherID = slotB.data('child').data('ID');
            if (this.getRoster(_tagA).swapSlots(_firstIdx, _secondIdx) === false) return false;
            this.notifyBackendRelocateBrother(sourceBrotherID, _secondIdx);
            this.notifyBackendRelocateBrother(targetBrotherID, _firstIdx);
        }
        return true;
    }

    // A brother is moved from one container into another:
    if (sourceOwner.isEmpty(_firstIdx))    return this.transferBrother(_secondIdx, _tagB, _firstIdx, _tagA);
    if (targetOwner.isEmpty(_secondIdx))   return this.transferBrother(_firstIdx, _tagA, _secondIdx, _tagB);

    // swapping two full slots
    var A = slotA.data('child');
    var B = slotB.data('child');

    A.data('idx', _secondIdx);
    B.data('idx', _firstIdx);

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

    this.notifyBackendMoveAtoB(A.data('ID'), _tagA, _secondIdx, _tagB);
    this.notifyBackendMoveAtoB(B.data('ID'), _tagB, _firstIdx, _tagA);

    this.swapBrothers(_firstIdx, sourceOwner, _secondIdx, targetOwner);

    if(this.getSelected().Index == _firstIdx && this.getSelected().OwnerID == _tagA)
    {
        this.setBrotherSelected(_secondIdx, _tagB, true);
    }
    else if(this.getSelected().Index == _secondIdx && this.getSelected().OwnerID == _tagB)
    {
        this.setBrotherSelected(_firstIdx, _tagA, true);
    }

    //this.updateRosterLabel();
}


// create empty slots
TroopQuarterDialogModule.prototype.createBrotherSlots = function ( _tag )
{
    var self = this;
    var isPlayer = _tag === Owner.Player;

    var parent = this.getRoster (_tag);
    parent.mSlots = [];

    for (var i = 0 ; i < parent.mSlotLimit; i++)
    {
        parent.mSlots.push(null);
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
        if (parent.mBrotherCurrent >= parent.mBrotherMax && drag.data('idx') > parent.mBrotherMax && drop.data('idx') <= parent.mBrotherMax && parent.mSlots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // always keep at least 1 in formation
        if (parent.mBrotherCurrent == parent.mBrotherMin && drag.data('idx') <= parent.mBrotherMax && drop.data('idx') > parent.mBrotherMax && parent.mSlots[drop.data('idx')].data('child') == null)
        {
            return false;
        }

        // do the swapping
        self.swapSlots(drag.data('idx'), drag.data('tag'), drop.data('idx'), drop.data('tag'));
    };

    for (var i = 0; i < parent.mSlots.length; ++i)
    {
        if (isPlayer)
        parent.mSlots[i] = $('<div class="ui-control is-brother-slot is-roster-slot"/>');
        else
        parent.mSlots[i] = $('<div class="ui-control is-brother-slot is-reserve-slot"/>');

        parent.ListScrollContainer.append(parent.mSlots[i]);

        parent.mSlots[i].data('idx', i);
        parent.mSlots[i].data('tag', _tag);
        parent.mSlots[i].data('child', null);
        parent.mSlots[i].drop("end", dropHandler);
    }
};
// add brother to empty slot
TroopQuarterDialogModule.prototype.addBrotherSlotDIV = function(_parent, _data, _index, _tag)
{
    var self = this;
    var parentDiv = _parent.mSlots[_index];
    var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
    var id = _data[CharacterScreenIdentifier.Entity.Id];

    // create: slot & background layer
    var result = parentDiv.createListBrother(id);
    result.attr('id', 'slot-index');
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
        var brotherID = _brother.data('brother')[CharacterScreenIdentifier.Entity.Id];

        self.setBrotherSelectedByID(brotherID);
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


TroopQuarterDialogModule.prototype.onBrothersListLoaded = function ( _ownerID )
{
    var parent = this.getRoster(_ownerID);
    for(var i = 0; i != parent.mSlots.length; ++i)
    {
        parent.mSlots[i].empty();
        parent.mSlots[i].data('child', null);
    }

    parent.mBrotherCurrent = 0;

    if (parent.mBrotherList === null || !jQuery.isArray(parent.mBrotherList) || parent.mBrotherList.length === 0)
    {
        return;
    }

    for (var i = 0; i < parent.mBrotherList.length; ++i)
    {
        var brother = parent.mBrotherList[i];

        if (brother !== null)
        {
            this.addBrotherSlotDIV(parent, brother, i, _ownerID);
        }
    }
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

TroopQuarterDialogModule.prototype.updateAssetValue = function (_container, _value, _valueMax)
{
    var label = _container.find('.label:first');
    if(label.length > 0)
    {
        var labelText = '' + Helper.numberWithCommas(_value);
        if(_valueMax !== undefined && _valueMax !== null) labelText += ('/' + Helper.numberWithCommas(_valueMax));

        label.html(labelText);
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

    var index = this.getSelected().Index;
    var tag = this.getSelected().OwnerID;
    var parent = this.getRoster(tag)
    parent.mBrotherList[index] = _data;
    parent.mSlots[index].empty();
    parent.mSlots[index].data('child', null);
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
