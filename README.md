# Créer un formulaire de demande de devis avec l'API de son site Kiubi


## Introduction

Ce dépôt est un tutoriel qui explique comment utiliser l'API de son site [Kiubi](http://www.kiubi.com) pour créer un formulaire de demande de devis.

L'objectif étant d'intégrer de façon automatique le contenu du panier de l'internaute dans une réponse à un formulaire *dismoi?*. Ce formulaire pourra ainsi être utilisé comme un formulaire de demande de devis.

![image](./docs/form.png?raw=true)

## Prérequis

Ce tutoriel suppose que vous avez un site Kiubi et qu'il est bien configuré : 

 - l'API est activée
 - le catalogue est activé
 - le site est en thème personnalisé, basé sur Shiroi

Il est préférable d'être à l'aise avec la manipulation des thèmes personnalisés. En cas de besoin, le [guide du designer](http://doc.kiubi.com) est là.

Ce tutoriel est applicable à tout thème graphique mais les exemples de codes donnés sont optimisés pour un rendu basé sur le thème Shiroi.


## Ajout d'un formulaire *dismoi?* dans la page de détail panier.

L'objectif est d'intégrer à la page de détail panier un formulaire dismoi?. Ce formulaire intégrera, dans un champ prévu à cet effet, un descriptif textuel du panier de l'utilisateur.

Pour y arriver, on utilise ici plusieurs composants :

 - le framework jQuery pour les manipulations javascript de base
 - le client Javascript API Front-office de Kiubi (qui est un plugin jQuery) pour récupérer les produits

Nous allons créer un fragment de template spécifique pour faciliter sa mise en place.

### Mise en place 

Créer un formulaire *dismoi?*. 
Ajouter un champ texte multi-lignes. Dans le champ Aide à la saisie, renseigner la valeur `%cart%`. Cette valeur permettra de retrouver le champ associé au contenu du panier et de pré-remplir sa valeur.

![image](./docs/dismoi.png?raw=true)

Ajouter d'autres champs si souhaité (civilité, coordonnées, message libre, ...) puis enregistrer le formulaire.

Dans l'onglet "Paramètres", repérer l'identifiant API du formulaire.

![image](./docs/config.png?raw=true)

Copier les fichiers `theme/fr/templates/devis.css` et `theme/fr/templates/forms.js` de ce dépôt dans le dossier `fr/templates/` du thème personnalisé. Copier le fichier `theme/fr/includes/devis.html` de ce dépôt dans le dossier `fr/includes/` du thème personnalisé. Ouvrir ce même fichier et **renseigner la variable `form_id` avec l'identifiant API du formulaire**.

<pre lang="javascript">
&lt;script type="text/javascript"&gt;
	var form_id = 'X-XXXXXXXXXXXXXXX'; // identifiant API
</pre>

Dans le Back-office du site, éditer une mise en page de type "détail panier". 

Placer le widget "Fragment de template" dans la page. Editer la configuration du widget et choisir le template "devis". 

La page de détail d'un produit affiche désormais un bouton "demande de devis". Un clic sur ce bouton, affiche un formulaire de demande de devis. A la soumission du formulaire, un réponse au formulaire dismoi sera créé et apparaitra dans le Back-office du site. Elle contiendra le contenu du panier de l'internaute. Un confirmation par e-mail sera également envoyée à l'internaute et au propriétaire du site.

### Explications

Examinons en détail le code HTML du fragment de template `devis.html` :

<pre lang="html">
&lt;link rel="stylesheet" href="{racine}/{theme}/{lg}/templates/devis.css" /&gt;

&lt;input id="show_modal" type="submit" value="Demande de devis" /&gt;

&lt;div id="overlay" style="display:none"&gt;
  &lt;div class="modal"&gt;
	&lt;h1&gt;Demande de devis&lt;/h1&gt;
	&lt;form method="post" onsubmit="return false;"&gt;
		&lt;div class="fields"&gt;&lt;center&gt;Chargement du formulaire...&lt;/center&gt;&lt;/div&gt;
		&lt;input type="submit" value="Demande de devis" /&gt;
		&lt;input type="reset" value="Annuler" class="submit reset close"&gt;
		&lt;footer&gt;Le contenu de votre panier sera joint à votre demande&lt;/footer&gt;
	&lt;/form&gt;
  &lt;/div&gt;
&lt;/div&gt;
</pre>
	
Cette première portion de code met en place le bouton "demande de devis". Ainsi que le bloc (masqué par défaut) permettant d'accueillir le formulaire dismoi?.

On inclut ensuite le client Javascript API Front-office de Kiubi ainsi que le fichier `forms.js` :

<pre lang="html">
&lt;script type="text/javascript" src="{cdn}/js/kiubi.api.pfo.jquery-1.0.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="{racine}/{theme}/{lg}/templates/forms.min.js"&gt;&lt;/script&gt;
</pre>

<pre lang="javascript">
&lt;script type="text/javascript"&gt;
	
	var form_id = 'X-XXXXXXXXXXXXXXX'; // identifiant API
	var $form = $('.modal form');
	var $container = $('.fields', $form);
	
</pre>

On initialise les variables `form_id`, `$form` et `$container` correspondant respectivement à l'identifiant unique du formulaire, l'objet jquery du formulaire HTML et enfin le conteneur destiné à accueillir les champs dudit formulaire.

##### Ouverture de la modal-box

<pre lang="javascript">
	/**
	 * Ouverture de la modal
	 */
	$("#show_modal").click(function(){
	
		$('#overlay').show();
		$('#overlay .modal').addClass('scrolldown');
</pre>

Au clic sur le bouton "Demande de devis", on affiche le fond et on ajoute la classe `scrolldown` à la modal-box. On récupère ensuite la configuration du formulaire dismoi? à l'aide du client Javascript API Front-office de Kiubi :

<pre lang="javascript">
		kiubi.forms.get(form_id).done(function(meta, APIForm){
</pre>

On vide puis remplit le conteneur à l'aide de la méthode `createForm()` définit dans le fichier `forms.js` précédemment inclus. Cette méthode accepte en premier argument une liste de champ issue d'une requête API et, en second argument, le noeud DOM dans lequel les champs seront ajoutés en HTML.

<pre lang="javascript">
			$container.empty();

			// on remplit le formulaire avec tous les champs 
			createForm(APIForm.fields, $container);
</pre>

On recherche ensuite le champ associé au panier :

<pre lang="javascript">
			var cart_field = $('[placeholder=\\%cart\\%]', $container);
			if(cart_field.length)
			{
				// on masque ce champ spécial, ainsi que son label
				cart_field.hide();
				$('label[for=' + cart_field.attr('id') +']').hide();
</pre>

Si le champ a été trouvé, on récupère le contenu du panier de l'internaute à l'aide du client Javascript API Front-office de Kiubi :

<pre lang="javascript">
				// on récupère le contenu du panier
				kiubi.cart.get().done(function(meta, data){
</pre>

On remplit enfin ce champ avec une version textuelle du contenu du panier :

<pre lang="javascript">
					var text = data.items_count + " produit(s) \n\n";
					data.items && $.each(data.items, function(num, item){
						text += "- " + item.product_name + " (" + item.name + ")\n";
						text += "\t quantité : " + item.quantity + "\n";
						text += "\t référence : " + item.sku + "\n";
						text += "\t URL : " + location.protocol + '//' + location.host + item.product_url + "\n";
						text += "\n";
					});
					// on ajoute un descriptif textuel du panier au champ
					cart_field.val(text);
				});
			}
		});
	});
</pre>

##### Soumission du formulaire

A la soumission du formulaire HTML, on utilise à nouveau l'API afin de stocker la demande de l'internaute.

<pre lang="javascript">
	/**
	 * Soumission du formulaire
	 */
	$form.submit(function(){
		var submit = kiubi.forms.submit(form_id, $form);
</pre>

En cas de succès, on remplace les champs du formulaire par le message de remerciement, on masque les erreurs éventuellement survenues lors d'une soumission antérieure, puis on renomme le bouton Annuler en Fermer :

<pre lang="javascript">
		// Réussite
		submit.done(function(meta, data){
			$container.empty();
			$container.append(data.message);
			
			$('footer, input[type=submit]', $form).hide();
			$('div.erreurs', $form).remove();
			$('input.close', $form).val('Fermer');
		});
</pre>

![image](./docs/confirm.png?raw=true)

##### Gestion des erreurs

En cas d'échec (champ obligatoire non renseigné, valeur d'un champ incorrecte, …), on affiche un div qui contiendra l'erreur ayant occasionnée cet échec :

<pre lang="javascript">
		// Echec
		submit.fail(function(meta, error, data){
			$('div.erreurs', $form).remove();
			var info_box = $('&lt;div>', {'class':'erreurs'});
			info_box.insertBefore($container);
			info_box.append(error.message);
</pre>

On ajoute une classe `erreur` aux champs ayant éventuellement occasionnés cette erreur :

<pre lang="javascript">	
			$('input, textarea, select', $form).removeClass('erreur');
			$.each(error.fields, function(){
				$('[name="'+this.field+'"]', $form).addClass('erreur');
				info_box.append("&lt;br>" + this.message);
			});
</pre>

Si un nouveau captcha est à renseigner, on met à jour la question de ce dernier, puis on vide la réponse précédente :

<pre lang="javascript">
			if(data && data.new_captcha) {
				// un nouveau captcha à été généré pour ce formulaire
				$('[name=captcha]', $form).val("");
				$('label[for=captcha]', $form).html(data.new_captcha+'&nbsp;*');
			}
		});

		return false; // empêche la soumission "normale" du formulaire.
	});
</pre>

![image](./docs/error.png?raw=true)

##### Fermeture de la modal-box

Pour finir, le code ci-dessous permet de fermer la modal-box au clic du bouton "Annuler/Fermer" :

<pre lang="javascript">
	/**
	 * Fermeture de la modal
	 */
	$('input.close', $form).click(function(){
		$('#overlay').hide();
		$('div.erreurs', $form).remove();
		$('#overlay .modal form *').show();
		$container.empty();
		$(this).val('Annuler'); // rétabli le nom du bouton
	});
&lt;/script&gt;
</pre>

La page affiche désormais un formulaire de demande de devis. Dans le back-office, les réponses à ce formulaire intègrent le contenu du panier :

![image](./docs/result.png?raw=true)

