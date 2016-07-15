
import ko from 'ko';

import {i18n} from 'Common/Translator';

import {showScreenPopup} from 'Knoin/Knoin';

import TemplateStore from 'Stores/User/Template';
import Remote from 'Remote/User/Ajax';

class TemplatesUserSettings
{
	constructor() {
		this.templates = TemplateStore.templates;

		this.processText = ko.computed(() => (TemplateStore.templates.loading() ? i18n('SETTINGS_TEMPLETS/LOADING_PROCESS') : ''));
		this.visibility = ko.computed(() => ('' === this.processText() ? 'hidden' : 'visible'));

		this.templateForDeletion = ko.observable(null).deleteAccessHelper();
	}

	scrollableOptions(sWrapper) {
		return {
			handle: '.drag-handle',
			containment: sWrapper || 'parent',
			axis: 'y'
		};
	}

	addNewTemplate() {
		showScreenPopup(require('View/Popup/Template'));
	}

	editTemplate(oTemplateItem) {
		if (oTemplateItem)
		{
			showScreenPopup(require('View/Popup/Template'), [oTemplateItem]);
		}
	}

	deleteTemplate(templateToRemove) {
		if (templateToRemove && templateToRemove.deleteAccess())
		{
			this.templateForDeletion(null);

			if (templateToRemove)
			{
				this.templates.remove((template) => templateToRemove === template);

				Remote.templateDelete(() => {
					this.reloadTemplates();
				}, templateToRemove.id);
			}
		}
	}

	reloadTemplates() {
		this.getApp().templates();
	}

	getApp() {
		return require('App/User').default;
	}

	onBuild(oDom) {
		var self = this;

		oDom
			.on('click', '.templates-list .template-item .e-action', function() {
				const template = ko.dataFor(this);
				if (template)
				{
					self.editTemplate(template);
				}
			});

		this.reloadTemplates();
	}
}

export {TemplatesUserSettings, TemplatesUserSettings as default};
