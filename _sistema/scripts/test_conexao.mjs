/**
 * test_conexao.mjs — Valida a conexão com o Bigin antes de rodar campanhas.
 * Uso: npm run test-conexao
 */

import { conectarBigin, buscarRemetente } from './bigin.mjs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

console.log("\n🔌 Testando conexão com o Bigin CRM...");

let client;
try {
    client = await conectarBigin();
    console.log("✅ Conexão estabelecida!\n");

    console.log("📧 Verificando email remetente configurado...");
    const fromEmail = await buscarRemetente(client);
    console.log(`   ✅ Remetente: ${fromEmail}\n`);

    console.log("🎉 Bigin operacional. Pode rodar: npm run start-campaign\n");
} catch (err) {
    console.error("\n❌ Falha na conexão:", err.message);
    console.error("\n   Verifique:");
    console.error("   1. BIGIN_MCP_URL no arquivo .env está correta?");
    console.error("   2. A URL foi gerada no painel Bigin > Integrações > MCP\n");
    process.exit(1);
} finally {
    process.exit(0);
}
