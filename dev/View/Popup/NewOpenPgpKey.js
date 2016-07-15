
var
	_ = require('_'),
	ko = require('ko'),

	Enums = require('Common/Enums'),
	Utils = require('Common/Utils'),

	PgpStore = require('Stores/User/Pgp'),

	kn = require('Knoin/Knoin'),
	AbstractView = require('Knoin/AbstractView');

/**
 * @constructor
 * @extends AbstractView
 */
function NewOpenPgpKeyPopupView()
{
	AbstractView.call(this, 'Popups', 'PopupsNewOpenPgpKey');

	this.email = ko.observable('');
	this.email.focus = ko.observable('');
	this.email.error = ko.observable(false);

	this.name = ko.observable('');
	this.password = ko.observable('');
	this.keyBitLength = ko.observable(Enums.Magics.BitLength2048);

	this.submitRequest = ko.observable(false);
	this.submitError = ko.observable('');

	this.email.subscribe(function() {
		this.email.error(false);
	}, this);

	this.generateOpenPgpKeyCommand = Utils.createCommand(this, function() {

		var
			self = this,
			oUserId = {},
			oOpenpgpKeyring = PgpStore.openpgpKeyring;

		this.email.error('' === Utils.trim(this.email()));
		if (!oOpenpgpKeyring || this.email.error())
		{
			return false;
		}

		oUserId.email = this.email();
		if ('' !== this.name())
		{
			oUserId.name = this.name();
		}

		this.submitRequest(true);
		this.submitError('');

		_.delay(function() {

			var mPromise = false;

			try {

				mPromise = PgpStore.openpgp.generateKey({
					userIds: [oUserId],
					numBits: Utils.pInt(self.keyBitLength()),
					passphrase: Utils.trim(self.password())
				});

				mPromise.then(function(mKeyPair) {

					self.submitRequest(false);

					if (mKeyPair && mKeyPair.privateKeyArmored)
					{
						oOpenpgpKeyring.privateKeys.importKey(mKeyPair.privateKeyArmored);
						oOpenpgpKeyring.publicKeys.importKey(mKeyPair.publicKeyArmored);

						oOpenpgpKeyring.store();

						require('App/User').default.reloadOpenPgpKeys();
						Utils.delegateRun(self, 'cancelCommand');
					}

				}).then(null, function(e) {
					self.submitRequest(false);
					self.showError(e);
				});
			}
			catch (e)
			{
				self.submitRequest(false);
				self.showError(e);
			}

		}, Enums.Magics.Time100ms);

		return true;
	});

	kn.constructorEnd(this);
}

kn.extendAsViewModel(['View/Popup/NewOpenPgpKey', 'PopupsNewOpenPgpKeyViewModel'], NewOpenPgpKeyPopupView);
_.extend(NewOpenPgpKeyPopupView.prototype, AbstractView.prototype);

NewOpenPgpKeyPopupView.prototype.showError = function(e)
{
	Utils.log(e);
	if (e && e.message)
	{
		this.submitError(e.message);
	}
};

NewOpenPgpKeyPopupView.prototype.clearPopup = function()
{
	this.name('');
	this.password('');

	this.email('');
	this.email.error(false);
	this.keyBitLength(Enums.Magics.BitLength2048);

	this.submitError('');
};

NewOpenPgpKeyPopupView.prototype.onShow = function()
{
	this.clearPopup();
};

NewOpenPgpKeyPopupView.prototype.onShowWithDelay = function()
{
	this.email.focus(true);
};

module.exports = NewOpenPgpKeyPopupView;
