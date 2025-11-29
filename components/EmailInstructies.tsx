import { Mail, AlertCircle, CheckCircle } from "lucide-react"

interface EmailInstructiesProps {
  email?: string
}

export function EmailInstructies({ email }: EmailInstructiesProps) {
  return (
    <div className="space-y-4 mt-6">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Account succesvol aangemaakt!
            </h3>
            <p className="text-sm text-green-800">
              We hebben een verificatie email gestuurd naar{" "}
              {email && <strong>{email}</strong>}
            </p>
          </div>
        </div>
      </div>

      {/* Email Niet Ontvangen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              📧 Email niet ontvangen?
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>Check je spam/junk folder</strong> - Nieuwe domeinen komen soms in spam
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Zoek naar emails van <code className="bg-blue-100 px-1 rounded">support@proefrit-autoofy.nl</code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Markeer als <strong>"Geen spam"</strong> of <strong>"Niet ongewenst"</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Voeg <code className="bg-blue-100 px-1 rounded">support@proefrit-autoofy.nl</code> toe aan je contacten
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Platform Specifieke Instructies */}
      <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <summary className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700">
          📱 Email uit spam halen (per platform)
        </summary>
        <div className="mt-3 space-y-3 text-sm text-gray-700">
          {/* Gmail */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">Gmail:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check de "Spam" folder in het linkermenu</li>
              <li>Open de email van Autoofy</li>
              <li>Klik op "Geen spam" bovenaan</li>
              <li>De email wordt verplaatst naar je inbox</li>
            </ol>
          </div>

          {/* Outlook */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">Outlook / Hotmail:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check de "Ongewenste e-mail" folder</li>
              <li>Rechtsklik op de email van Autoofy</li>
              <li>Selecteer "Ongewenste e-mail" → "Geen ongewenste e-mail"</li>
              <li>Voeg support@proefrit-autoofy.nl toe aan veilige afzenders</li>
            </ol>
          </div>

          {/* Apple Mail */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">Apple Mail:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check de "Ongewenst" folder</li>
              <li>Open de email van Autoofy</li>
              <li>Klik op "Geen ongewenste e-mail" bovenaan</li>
              <li>Voeg support@proefrit-autoofy.nl toe aan contacten</li>
            </ol>
          </div>

          {/* Yahoo */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">Yahoo Mail:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check de "Spam" folder</li>
              <li>Selecteer de email van Autoofy</li>
              <li>Klik op "Geen spam" bovenaan</li>
              <li>Voeg afzender toe aan contacten</li>
            </ol>
          </div>
        </div>
      </details>

      {/* Help Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              💡 Tip voor de toekomst
            </h3>
            <p className="text-sm text-amber-800">
              Voeg <strong>support@proefrit-autoofy.nl</strong> toe aan je contacten
              om te voorkomen dat toekomstige emails in spam terechtkomen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

