import { MODULOS_REAIS } from '../constants/config';
import * as real from './httpApi';
import * as mock from './mockApi';

/**
 * Ponto único de acesso a dados. As telas importam daqui e não sabem qual
 * implementação está ativa. Para ligar um módulo à API real, mude MODULOS_REAIS em config.ts.
 */
export const responsaveisApi = MODULOS_REAIS.responsaveis ? real.responsaveisApi : mock.responsaveisApi;
export const clientesApi = MODULOS_REAIS.clientes ? real.clientesApi : mock.clientesApi;
export const fornecedoresApi = MODULOS_REAIS.fornecedores ? real.fornecedoresApi : mock.fornecedoresApi;
export const recebimentosApi = MODULOS_REAIS.recebimentos ? real.recebimentosApi : mock.recebimentosApi;
export const saidasApi = MODULOS_REAIS.saidas ? real.saidasApi : mock.saidasApi;
export const relatoriosApi = MODULOS_REAIS.relatorios ? real.relatoriosApi : mock.relatoriosApi;
export const historicoApi = MODULOS_REAIS.historico ? real.historicoApi : mock.historicoApi;
