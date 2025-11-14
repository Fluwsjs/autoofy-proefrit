interface TermsAndConditionsProps {
  className?: string
}

export function TermsAndConditions({ className = "" }: TermsAndConditionsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-green-700 mb-4">
        Voorwaarden proefritprocedure
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Proefrit */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">Proefrit</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• De klant ontvangt het voertuig in bruikleen voor een bepaalde periode.</li>
              <li>• Het voertuig blijft eigendom van het autobedrijf.</li>
              <li>• De klant moet het voertuig op de datum en tijd zoals vermeld op de voorkant inleveren.</li>
              <li>• Het is niet toegestaan deze periode te verlengen zonder schriftelijke toestemming van het autobedrijf.</li>
              <li>• Voor elk uur dat het voertuig te laat wordt ingeleverd, kan het autobedrijf kosten in rekening brengen.</li>
              <li>• Bij rijden met een handelaarskenteken moet de klant zich wegens wettelijke bepalingen beperken tot het testen van het voertuig.</li>
              <li>• Dit betekent dat het verboden is het voertuig te parkeren op de openbare weg of te gebruiken voor het vervoeren van personen en/of goederen (bijv. boodschappen doen).</li>
            </ul>
          </div>

          {/* Kentekendocumenten */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">Kentekendocumenten</h4>
            <p className="text-muted-foreground">
              De klant moet alle kentekendocumenten die bij aanvang van de proefrit zijn verstrekt, aan het einde van de proefrit aan het autobedrijf inleveren.
            </p>
          </div>

          {/* Vrijwaring */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">Vrijwaring</h4>
            <p className="text-muted-foreground">
              De klant ontheft het bedrijf van alle schades voortvloeiend uit of ontstaan tijdens het gebruik van het voertuig, waaronder maar niet beperkt tot boetes, overtredingen en/of inbeslagneming en/of verbeurdverklaring van het voertuig, alsmede voor vorderingen van derden in verband met het gebruik van het voertuig.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Verzekering */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">Verzekering</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• De klant is aansprakelijk voor alle schades voortvloeiend uit of ontstaan tijdens het gebruik van het voertuig, voor zover deze niet gedekt worden door de op de voorkant vermelde verzekering.</li>
              <li>• Schade aan het voertuig ontstaan tijdens gebruik dient direct te worden gemeld aan het autobedrijf.</li>
              <li className="font-semibold text-foreground">
                N.B.: Indien het voertuig uitsluitend WA (aansprakelijkheidsverzekering) verzekerd is, is de klant jegens het autobedrijf volledig aansprakelijk voor schade aan of verlies van het voertuig en/of inzittenden indien geen derde daarvoor aansprakelijk is.
              </li>
            </ul>
          </div>

          {/* Persoonsgegevens */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">Persoonsgegevens</h4>
            <p className="text-muted-foreground mb-2">
              De persoonsgegevens van de klant zoals genoemd op het proefritformulier worden door het autobedrijf verwerkt, mogelijk in de zin van de Algemene Verordening Gegevensbescherming (AVG).
            </p>
            <p className="text-muted-foreground mb-2">
              Op basis van deze verwerking kan het autobedrijf de overeenkomst uitvoeren, de klant optimale service bieden, hen tijdig voorzien van actuele auto-informatie en gepersonaliseerde aanbiedingen doen.
            </p>
            <p className="text-muted-foreground mb-2">
              Daarnaast kunnen persoonsgegevens worden verstrekt aan derden, waaronder de importeur van een automerk, voor direct marketing activiteiten voor voertuigen.
            </p>
            <p className="text-muted-foreground">
              Elk bezwaar van de klant jegens het autobedrijf betreffende de verwerking van persoonsgegevens in de zin van de Algemene Verordening Gegevensbescherming (AVG) voor direct mailing activiteiten wordt gehonoreerd.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

