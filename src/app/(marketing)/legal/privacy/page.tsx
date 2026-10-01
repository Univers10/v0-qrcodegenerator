import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = { title: "Politique de confidentialité" }

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="1er octobre 2026">
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>Les données sont traitées par UNIVERS10, éditeur de QR Creator, dans le respect du RGPD.</p>
      </section>
      <section>
        <h2>2. Données des titulaires de compte</h2>
        <ul>
          <li>Nom, adresse email et mot de passe (stocké uniquement sous forme hachée).</li>
          <li>Contenus et paramètres de design de vos QR codes, y compris les logos importés.</li>
          <li>Données de session (adresse IP et navigateur de connexion) à des fins de sécurité.</li>
        </ul>
      </section>
      <section>
        <h2>3. Données collectées lors d&apos;un scan</h2>
        <p>Lorsqu&apos;un QR code dynamique est scanné, nous enregistrons :</p>
        <ul>
          <li>la date et l&apos;heure du scan ;</li>
          <li>le type d&apos;appareil, le système d&apos;exploitation et le navigateur ;</li>
          <li>le pays et la ville approximatifs, déduits par l&apos;hébergeur ;</li>
          <li>une empreinte anonyme, renouvelée chaque jour, servant à compter les visiteurs uniques.</li>
        </ul>
        <p className="mt-3">
          <strong className="text-foreground">Les adresses IP des personnes qui scannent ne sont jamais stockées.</strong>{" "}
          Aucun cookie n&apos;est déposé lors d&apos;un scan et aucune donnée n&apos;est revendue ni partagée à des fins
          publicitaires. Les robots et aperçus de liens sont exclus des statistiques.
        </p>
      </section>
      <section>
        <h2>4. Finalités et base légale</h2>
        <ul>
          <li>Fournir le service (exécution du contrat).</li>
          <li>Produire des statistiques agrégées pour le propriétaire du QR code (intérêt légitime).</li>
          <li>Sécuriser les comptes et prévenir les abus (intérêt légitime).</li>
        </ul>
      </section>
      <section>
        <h2>5. Conservation</h2>
        <p>
          Les données sont conservées tant que le compte est actif. La suppression d&apos;un QR code efface ses
          statistiques ; la suppression du compte efface l&apos;ensemble des données associées.
        </p>
      </section>
      <section>
        <h2>6. Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de portabilité (export CSV des
          scans) et d&apos;opposition. La suppression du compte est disponible à tout moment depuis les paramètres. Vous
          pouvez également introduire une réclamation auprès de la CNIL.
        </p>
      </section>
      <section>
        <h2>7. Cookies</h2>
        <p>
          QR Creator n&apos;utilise que des cookies strictement nécessaires (session de connexion, préférences
          d&apos;affichage). Aucun cookie de mesure d&apos;audience tiers n&apos;est utilisé.
        </p>
      </section>
    </LegalPage>
  )
}
