import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export async function getStates() {
  try {
    const response = await axios.get<IBGEState[]>(`${BASE_URL}/estados`);
    return response.data.map(state => ({ id: state.id, uf: state.sigla, nome: state.nome, regiao_nome: state.regiao.nome }));
  } catch (error) {
    logger.error('Error fetching states from IBGE API:', error);
    throw error;
  }
}

export async function getCitiesByState(uf: string) {
  try {
    const response = await axios.get<IBGECity[]>(`${BASE_URL}/estados/${uf}/municipios`);
    return response.data
      .filter(city => city.microrregiao && city.microrregiao.mesorregiao && city.microrregiao.mesorregiao.UF)
      .map(city => ({ id: city.id, nome: city.nome, estado_id: city.microrregiao.mesorregiao.UF.id }));
  } catch (error) {
    logger.error(`Error fetching cities for UF ${uf} from IBGE API:`, error);
    throw error;
  }
}