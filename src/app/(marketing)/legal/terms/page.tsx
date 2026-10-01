import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = { title: "Conditions d'utilisation" }

export default function TermsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updated="1er octobre 2026">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions encadrent l&apos;utilisation de QR Creator, service édité par UNIVERS10 permettant de
          créer, personnaliser, gérer et mesurer des QR codes. En utilisant le service, vous acceptez ces conditions.
        </p>
      </section>
      <section>
        <h2>2. Compte utilisateur</h2>
        <ul>
          <li>Le générateur public est utilisable sans compte pour les QR codes statiques.</li>
          <li>Un compte est requis pour les QR codes dynamiques, l&apos;enregistrement et les statistiques.</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants et de l&apos;activité de votre compte.</li>
        </ul>
      </section>
      <section>
        <h2>3. Usage acceptable</h2>
        <p>Il est interdit d&apos;utiliser QR Creator pour diriger vers des contenus :</p>
        <ul>
          <li>illicites, frauduleux ou trompeurs (hameçonnage, usurpation d&apos;identité, logiciels malveillants) ;</li>
          <li>portant atteinte aux droits de tiers (propriété intellectuelle, vie privée) ;</li>
          <li>incitant à la haine, à la violence ou à la discrimination.</li>
        </ul>
        <p className="mt-3">Tout QR code dynamique contrevenant à ces règles peut être désactivé sans préavis.</p>
      </section>
      <section>
        <h2>4. QR codes dynamiques</h2>
        <p>
          Un QR code dynamique redirige via nos serveurs. Il fonctionne tant que votre compte est actif et que le code
          n&apos;est ni mis en pause ni supprimé. La suppression d&apos;un code ou du compte rend immédiatement inopérants
          les QR dynamiques correspondants. Les QR statiques, qui encodent directement leur contenu, ne dépendent pas du
          service.
        </p>
      </section>
      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Vous conservez tous les droits sur les contenus et logos que vous importez, et sur les QR codes que vous
          générez. Vous garantissez disposer des droits nécessaires sur ces éléments.
        </p>
      </section>
      <section>
        <h2>6. Disponibilité et responsabilité</h2>
        <p>
          Le service est fourni « en l&apos;état ». Nous mettons tout en œuvre pour en assurer la disponibilité, sans
          garantie d&apos;absence d&apos;interruption. Testez systématiquement vos QR codes avant toute impression.
        </p>
      </section>
      <section>
        <h2>7. Modification des conditions</h2>
        <p>Ces conditions peuvent évoluer. La version en vigueur est celle publiée sur cette page.</p>
      </section>
    </LegalPage>
  )
}
