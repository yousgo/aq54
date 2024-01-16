### Build et construire l'application

Pour Demarrer l'application il vous faut juste exécuter les commandes ci dessous aprè avoir cloné le projet

### Creation de l'image Docker
Porur créer une image docker, ouvrir un terminal dans le dossier du projet puis exécuter la commande suivante. \
`docker build --pull --rm -f "Dockerfile" -t aq54:latest  .`

`-t`: Nom:Tag (si tag non specifié, docker utilisera "latest" par ddefaut) \
`-f`: File (Precise le chemin du Dokerfile)\
`--pull` : Essaira toujours de recuperer toutes les images referencées \
`--rm` : supprimera automatiquement le conteneur à son arret\

### Demarrer un conteneur docker
Pour demmarrer le conteneur docker, executer dans un terminal la commande suivante:\
`docker run -d -p 8080:80 aq54:latest`

`-d` : Exécuter le conteneur en arrière plan et afficher sont ID\
`-p` : Mapper les ports des images de bases \

l'application est maintenant accessible sur le lien `http://localhost:8080/` ou `http://{adresse locale ipv4 du serveur}:8080` pour des appreils du meme réseau.

