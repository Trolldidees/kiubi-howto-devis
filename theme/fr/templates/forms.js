/**
 * Kiubi API - forms.js
 * 
 * Copyright 2013 Troll d'idees
 */

/**
 * Methode permettant le rendu d'un formulaire dismoi?  
 * obtenu par l'API publique front-office de Kiubi
 *
 * @param fields array des champs du formulaire
 * @param form Formulaire ou conteneur dans lequel ajouter les champs
 * @return Element form
 */
var createForm = function(fields, form)
{
	var form = form || $('<form>');
	var fieldset = null;

	$.each(fields, function(num, field){

		field.id = (field.name == "captcha" ? "captcha" : "field_" + num);
		
		if(field.type == "fieldset") {
			fieldset = $('<fieldset>').appendTo(form);
			$('<legend>').html(this.label).appendTo(fieldset);
			return;
		}

		var formElement = createFormElement(field);
		var label = $('<label>', {
			'html' : field.label + (field.required?'&nbsp;*':''),
			'for' : field.id
		});

		if(formElement === false) return;
		if(formElement.attr('type') != "hidden") {
			label.appendTo(fieldset || form);
		}

		field.value && formElement.val(field.value);		
		formElement.appendTo(fieldset || form);

	});

	return form;
}

/**
 * Methode permettant le rendu d'un élément de formulaire
 * dismoi? obtenu par l'API publique front-office de Kiubi
 *
 * @param field 
 * @return Element
 */
var createFormElement = function(field)
{
	switch(field.type)
	{
		case 'text' : 
		case 'date' : 
		case 'datetime' : 
		case 'email' : 
		case 'hidden' :
		case 'lettres' :
		case 'password' :
			return $('<input>', {
				'id' : field.id,
				'type' : field.type, 
				'placeholder' : field.help,
				'name' : field.name,
				'class' : "textfield " + field.type
			});

		case 'chiffres' :
			return $('<input>', {
				'id' : field.id,
				'type' : 'number', 
				'placeholder' : field.help,
				'name' : field.name,
				'class' : "textfield " + field.type
			});

		case 'upload' :
			return $('<input>', {
				'id' : field.id,
				'type' : 'file',
				'name' : field.name,
				'class' : field.type
			});

		case 'textarea' :
			return $('<textarea>', {
				'id' : field.id,
				'placeholder' : field.help,
				'name' : field.name
			});

		case 'select' :
		case 'departements' :
		case 'regions' :
		case 'pays' :
			var element = $('<select>', {
				'id' : field.id,
				'name' : field.name
			});
			$.each(field.options, function(){
				$('<option>')
					.attr({'value':this.value})
					.html(this.label)
					.appendTo(element);
			});
			return element;

		case 'radio' :
		case 'civilite' :
		case 'checkbox' :
			var element = $('<div>', {
				'id' : field.id,
				'class' : field.type
			});
			$.each(field.options, function(){
				var input = $('<input>', {
					type : (field.type == "civilite" ? "radio" : field.type),
					name : field.name,
					value : this.value
				});

				$('<label>')
					.append(input)
					.append(this.label)
					.appendTo(element);
			});
			return element;

		default :
			return false;
	}
}