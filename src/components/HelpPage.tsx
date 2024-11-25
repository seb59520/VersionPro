import React from 'react';
import { ArrowLeft, HelpCircle, Shield, Book, Bell, Calendar, Users, Building2, FileText, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre d'aide</h1>
        <p className="text-gray-600">Guide complet d'utilisation de l'application de gestion des présentoirs</p>
      </div>

      {/* Guide d'utilisation */}
      <div className="space-y-8">
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Book className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Guide d'utilisation</h2>
          </div>

          <div className="space-y-6">
            {/* Gestion des présentoirs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                Gestion des présentoirs
              </h3>
              <div className="ml-7 space-y-3 text-gray-600">
                <p>• <strong>Ajouter un présentoir :</strong> Utilisez le bouton "+" pour créer un nouveau présentoir</p>
                <p>• <strong>Modifier un présentoir :</strong> Cliquez sur le présentoir pour accéder aux options de modification</p>
                <p>• <strong>Réserver un présentoir :</strong> Sélectionnez les dates et remplissez les informations requises</p>
                <p>• <strong>QR Code :</strong> Chaque présentoir dispose d'un QR code unique pour un accès rapide</p>
              </div>
            </div>

            {/* Gestion des affiches */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Gestion des affiches
              </h3>
              <div className="ml-7 space-y-3 text-gray-600">
                <p>• <strong>Ajouter une affiche :</strong> Téléchargez une nouvelle affiche avec ses informations</p>
                <p>• <strong>Changer d'affiche :</strong> Faites une demande de changement depuis la page du présentoir</p>
                <p>• <strong>Catégories :</strong> Organisez vos affiches par catégories pour une meilleure gestion</p>
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-gray-600" />
                Maintenance
              </h3>
              <div className="ml-7 space-y-3 text-gray-600">
                <p>• <strong>Maintenance préventive :</strong> Planifiez des interventions régulières</p>
                <p>• <strong>Maintenance curative :</strong> Signalez et suivez les problèmes techniques</p>
                <p>• <strong>Historique :</strong> Consultez l'historique complet des interventions</p>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                Notifications
              </h3>
              <div className="ml-7 space-y-3 text-gray-600">
                <p>• <strong>Alertes :</strong> Recevez des notifications pour les événements importants</p>
                <p>• <strong>Paramètres :</strong> Personnalisez vos préférences de notification</p>
                <p>• <strong>Rappels :</strong> Soyez informé des maintenances à venir</p>
              </div>
            </div>
          </div>
        </section>

        {/* RGPD */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">RGPD et Protection des données</h2>
          </div>

          <div className="space-y-6 text-gray-600">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Collecte des données</h3>
              <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Informations de compte (email, nom)</li>
                <li>Données de réservation</li>
                <li>Historique des maintenances</li>
                <li>Préférences de notification</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilisation des données</h3>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Gérer votre compte et vos accès</li>
                <li>Assurer le suivi des réservations</li>
                <li>Envoyer des notifications importantes</li>
                <li>Améliorer nos services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vos droits</h3>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sécurité</h3>
              <p>Nous mettons en œuvre les mesures suivantes pour protéger vos données :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Chiffrement des données</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Politique de confidentialité */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Politique de confidentialité</h2>
          </div>

          <div className="space-y-6 text-gray-600">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies et traceurs</h3>
              <p>Notre application utilise des cookies essentiels pour :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Maintenir votre session</li>
                <li>Mémoriser vos préférences</li>
                <li>Assurer la sécurité</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Partage des données</h3>
              <p>Nous ne partageons vos données qu'avec :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Les membres de votre organisation</li>
                <li>Nos sous-traitants techniques</li>
                <li>Les autorités (si requis par la loi)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Conservation des données</h3>
              <p>Vos données sont conservées :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Pendant la durée de votre utilisation du service</li>
                <li>3 ans après votre dernière connexion</li>
                <li>Les données de maintenance sont conservées 5 ans</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
              <p>Pour toute question concernant vos données :</p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Email : dpo@example.com</li>
                <li>Formulaire de contact dans les paramètres</li>
                <li>Délai de réponse : 30 jours maximum</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;