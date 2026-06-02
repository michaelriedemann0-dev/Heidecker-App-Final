import React from 'react';

const Impressum = () => {
  return (
    <div className="max-w-4xl mx-auto px-10 py-16">
      <h1 className="text-4xl font-bold mb-8">Impressum</h1>
      
      <p className="mb-4">Der Inhaber dieser Website ist:</p>
      
      <p className="mb-4">
        Thorsten Heidecker Maler- & Lackierermeister Personengesellschaft<br />
        Sandgasse 8a<br />
        63457 Hanau<br />
        Deutschland<br />
        E‑Mail: info@malermeisterfrankfurt.de<br />
        Phone number: 0 61 83 9 29 84 72
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-6">1. Allgemein</h2>
      <p className="mb-2">1.1 Der Beruf oder die Tätigkeiten, die auf dieser Website dargestellt werden, erfordern ein bestimmtes Diplom, wie hier angegeben:</p>
      <p className="mb-4">Maler- und Lackierermeister, dieses Diplom oder diese Berufsbezeichnung wurde in Deutschland verliehen.</p>

      <p className="mb-2">1.2 Für unsere Organisation gelten die folgenden berufsrechtlichen Vorschriften:</p>
      <p className="mb-2">Verordnung über die Berufsausbildung zum Maler und Lackierer und zur Malerin und Lackiererin (Maler- und Lackiererausbildungsverordnung – MalerLackAusbV)</p>
      <p className="mb-4">Sie können diese Regeln und Vorschriften hier aufrufen: <a href="https://www.gesetze-im-internet.de/malerlackausbv_2021/MalerLackAusbV.pdf" className="underline text-accent">MalerLackAusbV.pdf</a></p>
      
      <p className="mb-4">Wir sind bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <h2 className="text-2xl font-semibold mb-4 mt-6">2. Die folgenden Angaben sind nach deutscher Gesetzgebung zwingend erforderlich.</h2>
      
      <p className="mb-4">Bilder und Visualisierungen wurden und werden mit künstlicher Intelligenz erstellt, darunter Gemini 1.5 Flash-Lite Preview, ChatGPT und Canva AI. Für die Nutzung dieser Bilder gelten folgende Hinweise:</p>
      
      <h3 className="text-xl font-semibold mb-2">Art der Visualisierung</h3>
      <ul className="list-disc pl-5 mb-4">
        <li>Konzepte, die der Inspiration dienen, ohne technischen Anspruch.</li>
        <li>Keine verbindliche Darstellung von Material oder Statik.</li>
        <li>KI-Modelle können Fehler in Perspektive oder Proportionen erzeugen.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">Technische Einschränkungen</h3>
      <ul className="list-disc pl-5 mb-4">
        <li>Farbdarstellungen können je nach Monitor und Licht variieren.</li>
        <li>Texturen sind digitale Annäherungen, keine Originalmuster.</li>
        <li>Bauelemente dienen der optischen Orientierung.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">Fachliche Beratung & Umsetzung</h3>
      <ul className="list-disc pl-5 mb-6">
        <li>Die Umsetzung erfolgt nur nach Prüfung vor Ort.</li>
        <li>Individuelle Beratung durch Malermeister Frankfurt Heidecker ist erforderlich.</li>
        <li>Die verbindliche Farbwahl erfolgt ausschließlich über physische Farbmuster.</li>
      </ul>

      <hr className="my-8"/>
      <p className="italic">Die Nutzung dieser KI-Tools soll Visionen greifbar machen, während Malermeister Frankfurt Heidecker die handwerkliche Qualität und fachgerechte Ausführung garantiert.</p>
    </div>
  );
};

export default Impressum;
