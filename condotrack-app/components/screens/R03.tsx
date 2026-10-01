"use client";
import { useImportesOcultos } from "@/lib/privacidad";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { type Vista } from "@/lib/data";
import { avisosConLectura } from "@/lib/expensas";
import { useApp } from "@/lib/estado";

/* El feed se ordena por día, como cualquier centro de notificaciones:
   lo de hoy primero y lo viejo abajo. El dato que tenemos es relativo
   ("Hace 18 min", "Ayer"), así que el grupo sale de ahí. */
const GRUPOS = [
  { id: "hoy" as const, rotulo: "Hoy" },
  { id: "ayer" as const, rotulo: "Ayer" },
  { id: "antes" as const, rotulo: "Antes" },
];
/* la foto de cada aviso: el lugar donde pasa */
const FOTO: Record<string, string> = {
  caja: "/img/hero_lobby.jpg", expensa: "/img/fachada.jpg", alerta: "/img/fachada.jpg", pesos: "/img/fachada.jpg",
  persona: "/img/visitas_fondo.jpg", personaMas: "/img/visitas_fondo.jpg", calendario: "/img/esp_sum.jpg",
  chat: "/img/hero_araoz.jpg", campana: "/img/hero_araoz.jpg",
};

function grupoDe(cuando: string) {
  const c = cuando.toLowerCase();
  if (c.startsWith("hace") || c.includes("hoy")) return "hoy";
  if (c.includes("ayer")) return "ayer";
  return "antes";
}

/* DEC-002: Archivadas salió de la interfaz. No queda pestaña, ni filtro, ni
   acción de archivar o desarchivar. Los avisos que estaban archivados viven
   ahora en la lista general, conservando su estado de lectura y su lugar
   cronológico: no se borró ningún registro.

   Ronda 3 · lo no leído ya no se mezcla con "Hoy": va arriba, aparte, en
   cards carbón con texto blanco y la marca amarilla "Nueva", cada una con
   su "Marcar como leída". Lo leído queda abajo, por día, en filas sobre el
   fondo. El filtro Todas/No leídas sobraba: la separación ya lo resuelve. */
export function R03({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const ocultos = useImportesOcultos();
  const avisos = avisosConLectura(estado.avisosLeidos, estado.avisosAbiertos, false, ocultos);
  const nuevas = avisos.filter((a) => a.estado === "sinleer");
  const leidas = avisos.filter((a) => a.estado !== "sinleer");
  const abrir = (id: string, va?: Vista) => { hacer({ t: "aviso/abrir", id }); if (va) ir(va); };

  return (
    <div className="vista" id="r03">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Notificaciones</h1></div>

      {avisos.length === 0 ? (
        <Vacio icono="campana" titulo="Sin notificaciones" />
      ) : (
        <>
          {nuevas.length > 0 ? (
            <section className="noti-nuevas" aria-labelledby="noti-nuevas-h">
              <header className="noti-cab">
                <h2 id="noti-nuevas-h">Sin leer <span className="n">{nuevas.length}</span></h2>
                <button className="btn-ter" type="button" onClick={() => hacer({ t: "avisos/leer" })}>
                  Marcar todas como leídas
                </button>
              </header>
              <div className="noti-cards">
                {nuevas.map((a) => (
                  <article key={a.id} className="noti-card">
                    {/* v05 · la misma lógica que "En tu edificio": foto del lugar,
                        el aviso en un panel de vidrio y la marca "Nueva" */}
                    <button type="button" className="noti-abrir" onClick={() => abrir(a.id, a.va)}>
                      <img className="noti-foto" src={FOTO[a.icono] ?? "/img/hero_araoz.jpg"} alt="" />
                      <span className="arr"><span className="nueva">Nueva</span><time>{a.cuando}</time></span>
                      <span className="noti-vidrio">
                        <span className="ic" aria-hidden="true"><Icon n={a.icono} s={20} w={2} /></span>
                        <span className="d">
                          <b>{a.titulo}</b>
                          <span className="desc">{a.desc}</span>
                        </span>
                      </span>
                    </button>
                    <button type="button" className="noti-leer" onClick={() => hacer({ t: "aviso/abrir", id: a.id })}>
                      <Icon n="check" s={14} w={2.6} />Marcar como leída
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <p className="noti-aldia"><Icon n="check" s={16} w={2.4} />Estás al día: no te queda nada sin leer.</p>
          )}

          {GRUPOS.map((g) => {
            const del = leidas.filter((a) => grupoDe(a.cuando) === g.id);
            if (del.length === 0) return null;
            return (
              <section key={g.id} className="noti-grupo">
                <h2 className="dia">{g.rotulo}</h2>
                <div className="noti-filas">
                  {del.map((a) => (
                    <button key={a.id} type="button" className="noti-fila" onClick={() => abrir(a.id, a.va)}>
                      <span className="ic" aria-hidden="true"><Icon n={a.icono} s={18} w={1.9} /></span>
                      <span className="d">
                        <span className="h"><b>{a.titulo}</b><time>{a.cuando}</time></span>
                        <span className="desc">{a.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          <FinLista texto="Nada más para mostrar" />
        </>
      )}
    </div>
  );
}
