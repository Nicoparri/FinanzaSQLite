import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import AppLogo from './src/components/AppLogo';
import { getDatabase } from './src/db/database';
import {
  createCategoria,
  createCuenta,
  createPresupuesto,
  createTransaccion,
  defaultMonth,
  deleteCategoria,
  deleteCuenta,
  deleteTransaccion,
  ensureBaseData,
  getAppSettings,
  getInformeMensual,
  getTotalTransacciones,
  listCategorias,
  listCuentas,
  listCuentasConBalance,
  listPresupuestos,
  listTransacciones,
  saveAppSettings,
  updateTransaccion,
} from './src/db/repository';
import { generateSeedTransactions } from './src/db/seed';
import {
  AppSettings,
  BalanceCuenta,
  Categoria,
  InformeMensualFila,
  InicioSemana,
  MonedaPreferida,
  Presupuesto,
  TipoCuenta,
  TipoMovimiento,
  TransaccionConNombres,
} from './src/db/types';

type AppTab = 'inicio' | 'movimientos' | 'presupuestos' | 'ajustes' | 'analitica';
type MovimientoFiltro = 'todos' | TipoMovimiento;
type PeriodoFiltro = 'semana' | 'mes' | 'anio';

const APP_TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home-outline' },
  { id: 'movimientos', label: 'Movimientos', icon: 'swap-horizontal-outline' },
  { id: 'presupuestos', label: 'Presupuestos', icon: 'pie-chart-outline' },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings-outline' },
];

const INPUT_PLACEHOLDER_COLOR = '#5a6878';
const DEMO_SECURITY_PIN = '2580';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('inicio');
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Inicializando SQLite...');
  const [isStatusError, setIsStatusError] = useState(false);

  const [cuentas, setCuentas] = useState<BalanceCuenta[]>([]);
  const [cuentasBase, setCuentasBase] = useState<{ id: number; nombre: string; tipo: TipoCuenta }[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionConNombres[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [informe, setInforme] = useState<InformeMensualFila[]>([]);
  const [totalTransacciones, setTotalTransacciones] = useState(0);

  const [cuentaNombre, setCuentaNombre] = useState('');
  const [cuentaTipo, setCuentaTipo] = useState<TipoCuenta>('banco');
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [categoriaTipo, setCategoriaTipo] = useState<TipoMovimiento>('gasto');

  const [txCuentaId, setTxCuentaId] = useState<number | null>(null);
  const [txCategoriaId, setTxCategoriaId] = useState<number | null>(null);
  const [txTipo, setTxTipo] = useState<TipoMovimiento>('gasto');
  const [txImporte, setTxImporte] = useState('');
  const [txFecha, setTxFecha] = useState(`${defaultMonth()}-01`);
  const [txDescripcion, setTxDescripcion] = useState('');
  const [editingTxId, setEditingTxId] = useState<number | null>(null);

  const [presupuestoCategoriaId, setPresupuestoCategoriaId] = useState<number | null>(null);
  const [presupuestoMes, setPresupuestoMes] = useState(defaultMonth());
  const [presupuestoLimite, setPresupuestoLimite] = useState('');

  const [reportMes, setReportMes] = useState(defaultMonth());
  const [seedCountText, setSeedCountText] = useState('120');
  const [seedResult, setSeedResult] = useState('');

  const [movQuery, setMovQuery] = useState('');
  const [movFiltro, setMovFiltro] = useState<MovimientoFiltro>('todos');
  const [movPeriodo, setMovPeriodo] = useState<PeriodoFiltro>('mes');

  const [moneda, setMoneda] = useState<MonedaPreferida>('EUR');
  const [inicioSemana, setInicioSemana] = useState<InicioSemana>('lunes');
  const [notificaciones, setNotificaciones] = useState(true);
  const [faceId, setFaceId] = useState(true);
  const [bloqueoAuto, setBloqueoAuto] = useState(true);
  const [isNotificacionesOpen, setIsNotificacionesOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<Notifications.PermissionStatus>(
    Notifications.PermissionStatus.UNDETERMINED
  );
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const categoriasGasto = useMemo(
    () => categorias.filter((categoria) => categoria.tipo === 'gasto'),
    [categorias]
  );

  const categoriasTx = useMemo(() => {
    const sameType = categorias.filter((categoria) => categoria.tipo === txTipo);
    return sameType.length > 0 ? sameType : categorias;
  }, [categorias, txTipo]);

  const totalBalance = useMemo(
    () => cuentas.reduce((acum, cuenta) => acum + cuenta.balance, 0),
    [cuentas]
  );

  const resumenMesActual = useMemo(() => {
    const ingresos = transacciones
      .filter((tx) => tx.tipo === 'ingreso' && tx.fecha.startsWith(reportMes))
      .reduce((acum, tx) => acum + tx.importe, 0);

    const gastos = transacciones
      .filter((tx) => tx.tipo === 'gasto' && tx.fecha.startsWith(reportMes))
      .reduce((acum, tx) => acum + tx.importe, 0);

    const variacion = ingresos === 0 ? -100 : ((ingresos - gastos) / ingresos) * 100;
    return { ingresos, gastos, variacion };
  }, [reportMes, transacciones]);

  const movimientosFiltrados = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return transacciones.filter((tx) => {
      if (movFiltro !== 'todos' && tx.tipo !== movFiltro) {
        return false;
      }

      if (movPeriodo === 'mes' && !tx.fecha.startsWith(reportMes)) {
        return false;
      }

      if (movPeriodo === 'anio' && !tx.fecha.startsWith(reportMes.slice(0, 4))) {
        return false;
      }

      if (movPeriodo === 'semana') {
        const txDate = new Date(`${tx.fecha}T00:00:00`);
        if (txDate < sevenDaysAgo || txDate > now) {
          return false;
        }
      }

      if (!movQuery.trim()) {
        return true;
      }

      const query = movQuery.toLowerCase();
      return (
        tx.categoria_nombre.toLowerCase().includes(query)
        || tx.cuenta_nombre.toLowerCase().includes(query)
        || (tx.descripcion ?? '').toLowerCase().includes(query)
      );
    });
  }, [movFiltro, movPeriodo, movQuery, reportMes, transacciones]);

  const movimientosAgrupados = useMemo(() => {
    const groups: { titulo: string; items: TransaccionConNombres[] }[] = [];

    movimientosFiltrados.forEach((tx) => {
      const titulo = toRelativeDate(tx.fecha);
      const existing = groups.find((group) => group.titulo === titulo);
      if (existing) {
        existing.items.push(tx);
      } else {
        groups.push({ titulo, items: [tx] });
      }
    });

    return groups;
  }, [movimientosFiltrados]);

  const semanal = useMemo(() => {
    const results: { dia: string; gasto: number; ingreso: number }[] = [];

    for (let i = 6; i >= 0; i -= 1) {
      const current = new Date();
      current.setDate(current.getDate() - i);
      const key = formatDateISO(current);
      const label = current.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3);

      const ingreso = transacciones
        .filter((tx) => tx.tipo === 'ingreso' && tx.fecha === key)
        .reduce((acum, tx) => acum + tx.importe, 0);

      const gasto = transacciones
        .filter((tx) => tx.tipo === 'gasto' && tx.fecha === key)
        .reduce((acum, tx) => acum + tx.importe, 0);

      results.push({ dia: label, gasto, ingreso });
    }

    return results;
  }, [transacciones]);

  const presupuestosConUso = useMemo(() => {
    const gastoPorCategoria = new Map<string, number>(
      informe.map((fila) => [fila.categoria, fila.total])
    );

    return presupuestos.map((presupuesto) => {
      const gastado = gastoPorCategoria.get(presupuesto.categoria_nombre) ?? 0;
      const ratio = presupuesto.limite === 0 ? 0 : gastado / presupuesto.limite;
      return {
        ...presupuesto,
        gastado,
        ratio,
      };
    });
  }, [informe, presupuestos]);

  const resumenPresupuesto = useMemo(() => {
    const limite = presupuestosConUso.reduce((acum, item) => acum + item.limite, 0);
    const gastado = presupuestosConUso.reduce((acum, item) => acum + item.gastado, 0);
    const restante = limite - gastado;
    const ratio = limite === 0 ? 0 : gastado / limite;
    return { limite, gastado, restante, ratio };
  }, [presupuestosConUso]);

  const notificacionesItems = useMemo(() => {
    const items: { id: string; title: string; detail: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [];

    if (!notificaciones) {
      items.push({
        id: 'off',
        title: 'Notificaciones desactivadas',
        detail: 'Activalas en Ajustes para recibir alertas de gasto diario.',
        icon: 'notifications-off-outline',
      });
      return items;
    }

    items.push({
      id: 'monthly',
      title: `Resumen ${reportMes}`,
      detail: `Ingresos ${formatMoney(resumenMesActual.ingresos, moneda)} - Gastos ${formatMoney(resumenMesActual.gastos, moneda)}`,
      icon: 'calendar-outline',
    });

    if (resumenPresupuesto.ratio > 1) {
      items.push({
        id: 'budget_over',
        title: 'Presupuesto excedido',
        detail: 'Has superado el limite mensual. Ajusta categorias con mayor consumo.',
        icon: 'warning-outline',
      });
    } else if (resumenPresupuesto.ratio > 0.85) {
      items.push({
        id: 'budget_close',
        title: 'Cerca del limite mensual',
        detail: 'Estas por encima del 85% del presupuesto.',
        icon: 'alert-circle-outline',
      });
    }

    const ultimoMovimiento = transacciones[0];
    if (ultimoMovimiento) {
      items.push({
        id: 'last_tx',
        title: `Ultimo movimiento: ${ultimoMovimiento.categoria_nombre}`,
        detail: `${ultimoMovimiento.fecha} - ${formatMoney(ultimoMovimiento.importe, moneda)}`,
        icon: 'swap-horizontal-outline',
      });
    }

    if (items.length === 0) {
      items.push({
        id: 'empty',
        title: 'Sin novedades',
        detail: 'No hay alertas para mostrar por ahora.',
        icon: 'checkmark-circle-outline',
      });
    }

    return items;
  }, [moneda, notificaciones, reportMes, resumenMesActual.gastos, resumenMesActual.ingresos, resumenPresupuesto.ratio, transacciones]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    reloadAll();
  }, [reportMes]);

  useEffect(() => {
    if (!txCategoriaId) {
      return;
    }

    const exists = categoriasTx.some((categoria) => categoria.id === txCategoriaId);
    if (!exists && categoriasTx.length > 0) {
      setTxCategoriaId(categoriasTx[0].id);
    }
  }, [categoriasTx, txCategoriaId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      const movedToBackground =
        previousState === 'active' && (nextState === 'inactive' || nextState === 'background');

      appStateRef.current = nextState;

      if (bloqueoAuto && movedToBackground) {
        setIsAppLocked(true);
        setUnlockPin('');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [bloqueoAuto]);

  useEffect(() => {
    if (!bloqueoAuto) {
      setIsAppLocked(false);
      setUnlockPin('');
    }
  }, [bloqueoAuto]);

  function setSuccess(msg: string): void {
    setIsStatusError(false);
    setStatusMessage(msg);
  }

  function setError(msg: string): void {
    setIsStatusError(true);
    setStatusMessage(msg);
  }

  async function persistSettings(next: Partial<AppSettings>, successMessage?: string): Promise<void> {
    await saveAppSettings(next);
    if (successMessage) {
      setSuccess(successMessage);
    }
  }

  async function ensureNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true;
    }

    let permissionResponse = await Notifications.getPermissionsAsync();
    let status = permissionResponse.status;

    if (status !== 'granted') {
      permissionResponse = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      status = permissionResponse.status;
    }

    setNotificationPermission(status);
    return status === 'granted';
  }

  async function scheduleDailyNotification(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Resumen diario de finanzas',
        body: 'Revisa tus gastos y presupuestos antes de cerrar el dia.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  }

  async function syncNotifications(enabled: boolean, persistDisabled = false): Promise<boolean> {
    if (!enabled) {
      if (Platform.OS === 'ios') {
        const permissionResponse = await Notifications.getPermissionsAsync();
        setNotificationPermission(permissionResponse.status);
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      return false;
    }

    const granted = await ensureNotificationPermission();
    if (!granted) {
      if (persistDisabled) {
        await saveAppSettings({ notificaciones: false });
      }
      return false;
    }

    await scheduleDailyNotification();
    return true;
  }

  async function loadAppSettings(): Promise<AppSettings> {
    const settings = await getAppSettings();

    setMoneda(settings.moneda);
    setInicioSemana(settings.inicioSemana);
    setNotificaciones(settings.notificaciones);
    setFaceId(settings.faceId);
    setBloqueoAuto(settings.bloqueoAuto);

    return settings;
  }

  async function initialize(): Promise<void> {
    try {
      await getDatabase();
      await ensureBaseData();

      const settings = await loadAppSettings();
      const notificationsEnabled = await syncNotifications(settings.notificaciones, true);
      if (notificationsEnabled !== settings.notificaciones) {
        setNotificaciones(notificationsEnabled);
      }

      await reloadAll();
      setSuccess('Base de datos lista.');
      setIsReady(true);
    } catch (error) {
      setError(getErrorMessage(error));
      setIsReady(false);
    }
  }

  async function reloadAll(): Promise<void> {
    const [
      cuentasRows,
      cuentasDomain,
      categoriasRows,
      transaccionesRows,
      presupuestosRows,
      total,
      informeRows,
    ] = await Promise.all([
      listCuentasConBalance(),
      listCuentas(),
      listCategorias(),
      listTransacciones(250),
      listPresupuestos(),
      getTotalTransacciones(),
      getInformeMensual(reportMes),
    ]);

    setCuentas(cuentasRows);
    setCuentasBase(cuentasDomain);
    setCategorias(categoriasRows);
    setTransacciones(transaccionesRows);
    setPresupuestos(presupuestosRows);
    setTotalTransacciones(total);
    setInforme(informeRows);

    if (cuentasDomain.length > 0 && txCuentaId === null) {
      setTxCuentaId(cuentasDomain[0].id);
    }

    const categoriasCandidatas = categoriasRows.filter((categoria) => categoria.tipo === txTipo);
    const categoriaDefault = categoriasCandidatas[0] ?? categoriasRows[0];
    if (categoriaDefault && txCategoriaId === null) {
      setTxCategoriaId(categoriaDefault.id);
    }

    const gastosDefault = categoriasRows.find((categoria) => categoria.tipo === 'gasto');
    if (gastosDefault && presupuestoCategoriaId === null) {
      setPresupuestoCategoriaId(gastosDefault.id);
    }
  }

  async function handleCreateCuenta(): Promise<void> {
    if (!cuentaNombre.trim()) {
      setSuccess('Introduce nombre de cuenta.');
      return;
    }

    try {
      await createCuenta(cuentaNombre.trim(), cuentaTipo);
      setCuentaNombre('');
      setSuccess('Cuenta creada.');
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleDeleteCuenta(cuentaId: number): Promise<void> {
    try {
      await deleteCuenta(cuentaId);
      setSuccess('Cuenta eliminada.');
      await reloadAll();
    } catch (error) {
      setError('No se puede eliminar una cuenta con transacciones asociadas.');
    }
  }

  async function handleCreateCategoria(): Promise<void> {
    if (!categoriaNombre.trim()) {
      setSuccess('Introduce nombre de categoria.');
      return;
    }

    try {
      await createCategoria(categoriaNombre.trim(), categoriaTipo);
      setCategoriaNombre('');
      setSuccess('Categoria creada.');
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleDeleteCategoria(categoriaId: number): Promise<void> {
    try {
      await deleteCategoria(categoriaId);
      setSuccess('Categoria eliminada con integridad referencial activa.');
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function resetTransaccionForm(): void {
    setEditingTxId(null);
    setTxImporte('');
    setTxDescripcion('');
    setTxFecha(`${defaultMonth()}-01`);
  }

  async function handleSaveTransaccion(): Promise<void> {
    const parsedImporte = Number(txImporte);
    if (!txCuentaId || !txCategoriaId || Number.isNaN(parsedImporte) || parsedImporte <= 0) {
      setSuccess('Completa cuenta, categoria e importe mayor a cero.');
      return;
    }

    try {
      if (editingTxId) {
        await updateTransaccion({
          id: editingTxId,
          cuentaId: txCuentaId,
          categoriaId: txCategoriaId,
          tipo: txTipo,
          importe: parsedImporte,
          fecha: txFecha,
          descripcion: txDescripcion,
        });
        setSuccess('Movimiento actualizado.');
      } else {
        await createTransaccion({
          cuentaId: txCuentaId,
          categoriaId: txCategoriaId,
          tipo: txTipo,
          importe: parsedImporte,
          fecha: txFecha,
          descripcion: txDescripcion,
        });
        setSuccess('Movimiento registrado.');
      }

      resetTransaccionForm();
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function handleEditTransaccion(tx: TransaccionConNombres): void {
    setEditingTxId(tx.id);
    setTxTipo(tx.tipo);
    setTxCuentaId(tx.cuenta_id);
    setTxCategoriaId(tx.categoria_id);
    setTxImporte(String(tx.importe));
    setTxFecha(tx.fecha);
    setTxDescripcion(tx.descripcion ?? '');
    setSuccess(`Editando movimiento #${tx.id}.`);
  }

  function handleDeleteTransaccion(txId: number): void {
    Alert.alert(
      'Eliminar movimiento',
      'Esta accion no se puede deshacer. Quieres continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaccion(txId);
              if (editingTxId === txId) {
                resetTransaccionForm();
              }
              setSuccess('Movimiento eliminado.');
              await reloadAll();
            } catch (error) {
              setError(getErrorMessage(error));
            }
          },
        },
      ]
    );
  }

  async function handleCreatePresupuesto(): Promise<void> {
    const parsedLimite = Number(presupuestoLimite);
    if (!presupuestoCategoriaId || Number.isNaN(parsedLimite) || parsedLimite <= 0) {
      setSuccess('Selecciona categoria y limite valido.');
      return;
    }

    try {
      await createPresupuesto(presupuestoCategoriaId, presupuestoMes, parsedLimite);
      setPresupuestoLimite('');
      setSuccess('Presupuesto actualizado.');
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleGenerateSeed(): Promise<void> {
    const count = Number(seedCountText);
    const boundedCount = Math.min(500, Math.max(100, Number.isNaN(count) ? 100 : count));

    try {
      const result = await generateSeedTransactions(boundedCount, reportMes);
      setSeedResult(
        `Seed completado: ${result.inserted} transacciones en ${result.elapsedMs.toFixed(2)} ms.`
      );
      setSuccess('Datos de prueba generados.');
      await reloadAll();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function goToNuevoMovimiento(tipo: TipoMovimiento): void {
    setTxTipo(tipo);
    setActiveTab('movimientos');
    setSuccess(`Formulario preparado para nuevo ${tipo}.`);
  }

  function handleMonedaChange(next: MonedaPreferida): void {
    setMoneda(next);
    void persistSettings({ moneda: next }, `Moneda actualizada a ${next}.`);
  }

  function handleInicioSemanaChange(next: InicioSemana): void {
    setInicioSemana(next);
    void persistSettings({ inicioSemana: next }, `Inicio de semana actualizado a ${next}.`);
  }

  async function handleNotificacionesChange(next: boolean): Promise<void> {
    if (!next) {
      try {
        setNotificaciones(false);
        await syncNotifications(false);
        await persistSettings({ notificaciones: false }, 'Notificaciones desactivadas.');
      } catch (error) {
        setError(getErrorMessage(error));
      }
      return;
    }

    try {
      const enabled = await syncNotifications(true);
      if (!enabled) {
        setNotificaciones(false);
        await persistSettings({ notificaciones: false });
        setError('Permiso de notificaciones denegado en iOS. Activalo en Ajustes del sistema.');
        return;
      }

      setNotificaciones(true);
      await persistSettings({ notificaciones: true }, 'Notificaciones iOS activadas (resumen diario a las 20:00).');
    } catch (error) {
      setNotificaciones(false);
      setError(getErrorMessage(error));
    }
  }

  async function isBiometricAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const hasEnrollment = await LocalAuthentication.isEnrolledAsync();

    return hasHardware && hasEnrollment;
  }

  async function handleFaceIdChange(next: boolean): Promise<void> {
    if (!next) {
      setFaceId(false);
      await persistSettings({ faceId: false }, 'Face ID desactivado.');
      return;
    }

    try {
      const available = await isBiometricAvailable();
      if (!available) {
        setFaceId(false);
        await persistSettings({ faceId: false });
        setError('Face ID/Touch ID no esta disponible en este dispositivo iOS.');
        return;
      }

      setFaceId(true);
      await persistSettings({ faceId: true }, 'Face ID activado para desbloqueo.');
    } catch (error) {
      setFaceId(false);
      setError(getErrorMessage(error));
    }
  }

  function handleBloqueoAutoChange(next: boolean): void {
    setBloqueoAuto(next);
    if (!next) {
      setIsAppLocked(false);
      setUnlockPin('');
    }

    void persistSettings(
      { bloqueoAuto: next },
      next ? 'Bloqueo automatico activado.' : 'Bloqueo automatico desactivado.'
    );
  }

  async function handleUnlockWithBiometric(): Promise<void> {
    try {
      const available = await isBiometricAvailable();
      if (!available) {
        setError('No hay biometria disponible. Usa el PIN de respaldo.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear Finanzas',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar codigo del dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAppLocked(false);
        setUnlockPin('');
        setSuccess('App desbloqueada correctamente.');
        return;
      }

      if (result.error !== 'user_cancel') {
        setError('No se pudo verificar la identidad.');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function handleUnlockWithPin(): void {
    if (unlockPin.trim() === DEMO_SECURITY_PIN) {
      setIsAppLocked(false);
      setUnlockPin('');
      setSuccess('App desbloqueada con PIN local.');
      return;
    }

    setError('PIN incorrecto. Usa el PIN demo 2580.');
  }

  async function handleSendTestNotification(): Promise<void> {
    try {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        setError('No hay permiso de notificaciones en iOS.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificacion de prueba',
          body: 'Las notificaciones locales estan funcionando en iOS.',
          sound: 'default',
        },
        trigger: null,
      });

      setSuccess('Notificacion de prueba enviada.');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  function handleOpenNotificaciones(): void {
    if (!notificaciones) {
      setSuccess('Activa las notificaciones en Ajustes para abrir el panel.');
      return;
    }

    setIsNotificacionesOpen(true);
    setSuccess('Panel de notificaciones abierto.');
  }

  function handleOpenAnalitica(): void {
    setActiveTab('analitica');
    setSuccess('Vista de analitica detallada abierta.');
  }

  function renderHeader(): React.ReactNode {
    return (
      <View style={styles.headerRow}>
        <AppLogo variant="compact" />
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton} onPress={handleOpenNotificaciones}>
            <Ionicons name="notifications-outline" size={18} color="#3a546a" />
          </Pressable>
          <Pressable style={styles.headerIconButton} onPress={handleOpenAnalitica}>
            <Ionicons name="analytics-outline" size={18} color="#3a546a" />
          </Pressable>
        </View>
      </View>
    );
  }

  function renderSwipeActions(tx: TransaccionConNombres): React.ReactNode {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.swipeActionButton, styles.swipeEditButton]}
          onPress={() => handleEditTransaccion(tx)}
        >
          <Ionicons name="create-outline" size={15} color="#ffffff" />
          <Text style={styles.swipeActionText}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.swipeActionButton, styles.swipeDeleteButton]}
          onPress={() => handleDeleteTransaccion(tx.id)}
        >
          <Ionicons name="trash-outline" size={15} color="#ffffff" />
          <Text style={styles.swipeActionText}>Eliminar</Text>
        </Pressable>
      </View>
    );
  }

  function renderDashboard(): React.ReactNode {
    const maxValue = Math.max(
      ...semanal.map((item) => Math.max(item.gasto, item.ingreso)),
      1
    );

    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Balance total</Text>
          <Text style={styles.heroAmount}>{formatMoney(totalBalance, moneda)}</Text>
          <Text style={styles.heroSubtext}>Mes {reportMes}</Text>
          <Text style={resumenMesActual.variacion >= 0 ? styles.deltaPositive : styles.deltaNegative}>
            {resumenMesActual.variacion >= 0 ? '+' : ''}{resumenMesActual.variacion.toFixed(1)}% vs ingresos
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroChip}>
              <Ionicons name="arrow-down-circle-outline" size={14} color="#ffd5d5" />
              <Text style={styles.heroChipText}>Gastos {formatMoney(resumenMesActual.gastos, moneda)}</Text>
            </View>
            <View style={styles.heroChip}>
              <Ionicons name="arrow-up-circle-outline" size={14} color="#8ff2a2" />
              <Text style={styles.heroChipText}>Ingresos {formatMoney(resumenMesActual.ingresos, moneda)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsRow}>
          <Pressable style={styles.primaryAction} onPress={() => goToNuevoMovimiento('gasto')}>
            <View style={styles.actionInner}>
              <Ionicons name="remove-circle-outline" size={16} color="#ffffff" />
              <Text style={styles.primaryActionText}>Anadir gasto</Text>
            </View>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => goToNuevoMovimiento('ingreso')}>
            <View style={styles.actionInner}>
              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
              <Text style={styles.secondaryActionText}>Anadir ingreso</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Categorias</Text>
          {informe.length === 0 ? (
            <Text style={styles.emptyHint}>Sin datos para {reportMes}.</Text>
          ) : (
            informe.slice(0, 4).map((fila) => {
              const totalMes = Math.max(...informe.map((item) => item.total), 1);
              const progress = Math.min(1, fila.total / totalMes);
              return (
                <View key={`${fila.categoria}-${fila.mes}`} style={styles.progressItem}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressName}>{fila.categoria}</Text>
                    <Text style={styles.progressAmount}>{formatMoney(fila.total, moneda)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Tendencia semanal</Text>
          {semanal.map((item) => (
            <View key={item.dia} style={styles.trendRow}>
              <Text style={styles.trendDay}>{item.dia}</Text>
              <View style={styles.trendBars}>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendIncome,
                      { width: `${Math.max(4, (item.ingreso / maxValue) * 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendExpense,
                      { width: `${Math.max(4, (item.gasto / maxValue) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Movimientos recientes</Text>
          {transacciones.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIconCircle}>
                <Ionicons
                  name={getCategoryIcon(tx.categoria_nombre, tx.tipo)}
                  size={14}
                  color={tx.tipo === 'gasto' ? '#a54343' : '#1f7f2a'}
                />
              </View>
              <View style={styles.txMain}>
                <Text style={styles.txTitle}>{tx.categoria_nombre}</Text>
                <Text style={styles.txMeta}>{tx.fecha} - {tx.cuenta_nombre}</Text>
              </View>
              <Text style={tx.tipo === 'gasto' ? styles.txExpense : styles.txIncome}>
                {tx.tipo === 'gasto' ? '-' : '+'}{formatMoney(tx.importe, moneda)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderMovimientos(): React.ReactNode {
    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.screenTitle}>Movimientos</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#6a7d8f" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar movimiento, cuenta o nota"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={movQuery}
            onChangeText={setMovQuery}
          />
        </View>

        <SelectorPills<MovimientoFiltro>
          value={movFiltro}
          options={['todos', 'gasto', 'ingreso']}
          labelFor={(option) => (option === 'todos' ? 'Todos' : option)}
          onSelect={setMovFiltro}
        />

        <SelectorPills<PeriodoFiltro>
          value={movPeriodo}
          options={['semana', 'mes', 'anio']}
          onSelect={setMovPeriodo}
        />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Nuevo movimiento</Text>

          <SelectorPills<TipoMovimiento>
            value={txTipo}
            options={['gasto', 'ingreso']}
            onSelect={setTxTipo}
          />

          <FieldLabel label="Cuenta" />
          <SelectorPills<number>
            value={txCuentaId}
            options={cuentasBase.map((cuenta) => cuenta.id)}
            labelFor={(id) => cuentasBase.find((cuenta) => cuenta.id === id)?.nombre ?? String(id)}
            onSelect={setTxCuentaId}
          />

          <FieldLabel label="Categoria" />
          <SelectorPills<number>
            value={txCategoriaId}
            options={categoriasTx.map((categoria) => categoria.id)}
            labelFor={(id) => categoriasTx.find((categoria) => categoria.id === id)?.nombre ?? String(id)}
            onSelect={setTxCategoriaId}
          />

          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="Importe"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={txImporte}
            onChangeText={setTxImporte}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha (YYYY-MM-DD)"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={txFecha}
            onChangeText={setTxFecha}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripcion"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={txDescripcion}
            onChangeText={setTxDescripcion}
          />

          <Pressable style={styles.primaryButton} onPress={handleSaveTransaccion}>
            <Text style={styles.primaryButtonText}>
              {editingTxId ? 'Actualizar movimiento' : 'Guardar movimiento'}
            </Text>
          </Pressable>

          {editingTxId ? (
            <Pressable style={styles.secondaryButton} onPress={resetTransaccionForm}>
              <Text style={styles.secondaryButtonText}>Cancelar edicion</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Lista de movimientos</Text>
          <Text style={styles.helperText}>Desliza a la izquierda para editar o eliminar.</Text>

          {movimientosAgrupados.length === 0 ? (
            <Text style={styles.emptyHint}>No hay movimientos para este filtro.</Text>
          ) : (
            movimientosAgrupados.map((group) => (
              <View key={group.titulo} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{group.titulo}</Text>
                {group.items.map((tx) => (
                  <Swipeable
                    key={tx.id}
                    renderRightActions={() => renderSwipeActions(tx)}
                    overshootRight={false}
                  >
                    <View style={styles.txCard}>
                      <View style={styles.txCardIcon}>
                        <Ionicons
                          name={getCategoryIcon(tx.categoria_nombre, tx.tipo)}
                          size={15}
                          color={tx.tipo === 'gasto' ? '#a54343' : '#1f7f2a'}
                        />
                      </View>
                      <View style={styles.txCardMain}>
                        <Text style={styles.txTitle}>{tx.categoria_nombre}</Text>
                        <Text style={styles.txMeta}>
                          {tx.cuenta_nombre} - {tx.descripcion || 'Sin nota'}
                        </Text>
                      </View>
                      <Text style={tx.tipo === 'gasto' ? styles.txExpense : styles.txIncome}>
                        {tx.tipo === 'gasto' ? '-' : '+'}{formatMoney(tx.importe, moneda)}
                      </Text>
                    </View>
                  </Swipeable>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  function renderPresupuestos(): React.ReactNode {
    const insight = getInsightFromBudget(resumenPresupuesto.ratio);

    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.screenTitle}>Presupuestos</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Resumen mensual</Text>
          <Text style={styles.heroAmount}>{formatMoney(resumenPresupuesto.limite, moneda)}</Text>
          <Text style={styles.heroSubtext}>Asignado</Text>
          <Text style={styles.heroSubtext}>Gastado: {formatMoney(resumenPresupuesto.gastado, moneda)}</Text>
          <Text style={resumenPresupuesto.restante >= 0 ? styles.deltaPositive : styles.deltaNegative}>
            Restante: {formatMoney(resumenPresupuesto.restante, moneda)}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Presupuesto por categoria</Text>
          {presupuestosConUso.length === 0 ? (
            <Text style={styles.emptyHint}>Aun no hay presupuestos creados.</Text>
          ) : (
            presupuestosConUso.map((item) => {
              const progress = Math.min(item.ratio, 1.2);
              return (
                <View key={item.id} style={styles.progressItem}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressName}>{item.categoria_nombre}</Text>
                    <Text style={styles.progressAmount}>
                      {formatMoney(item.gastado, moneda)} / {formatMoney(item.limite, moneda)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        item.ratio > 1 ? styles.progressFillDanger : item.ratio > 0.85 ? styles.progressFillWarn : null,
                        { width: `${Math.max(8, progress * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressCaption}>{budgetStatus(item.ratio)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightTitleRow}>
            <Ionicons name="bulb-outline" size={15} color="#114d72" />
            <Text style={styles.insightTitle}>Insight</Text>
          </View>
          <Text style={styles.insightText}>{insight}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Crear o editar presupuesto</Text>
          <FieldLabel label="Categoria de gasto" />
          <SelectorPills<number>
            value={presupuestoCategoriaId}
            options={categoriasGasto.map((categoria) => categoria.id)}
            labelFor={(id) => categoriasGasto.find((categoria) => categoria.id === id)?.nombre ?? String(id)}
            onSelect={setPresupuestoCategoriaId}
          />

          <TextInput
            style={styles.input}
            placeholder="Mes (YYYY-MM)"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={presupuestoMes}
            onChangeText={setPresupuestoMes}
          />
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="Limite"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={presupuestoLimite}
            onChangeText={setPresupuestoLimite}
          />

          <Pressable style={styles.primaryButton} onPress={handleCreatePresupuesto}>
            <Text style={styles.primaryButtonText}>Guardar presupuesto</Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Mes de analisis (YYYY-MM)"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={reportMes}
            onChangeText={setReportMes}
          />
        </View>
      </ScrollView>
    );
  }

  function renderAjustes(): React.ReactNode {
    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.screenTitle}>Ajustes</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Preferencias</Text>
          <FieldLabel label="Moneda" />
          <SelectorPills<MonedaPreferida>
            value={moneda}
            options={['EUR', 'USD', 'GBP']}
            onSelect={handleMonedaChange}
          />
          <FieldLabel label="Inicio de semana" />
          <SelectorPills<InicioSemana>
            value={inicioSemana}
            options={['lunes', 'domingo']}
            onSelect={handleInicioSemanaChange}
          />
          <ToggleRow
            title="Notificaciones"
            description="Resumen diario de gastos"
            value={notificaciones}
            onChange={(next) => {
              void handleNotificacionesChange(next);
            }}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Seguridad</Text>
          <ToggleRow
            title="Face ID"
            description="Desbloqueo biometrico iOS"
            value={faceId}
            onChange={(next) => {
              void handleFaceIdChange(next);
            }}
          />
          <ToggleRow
            title="Bloqueo automatico"
            description="Bloquear al salir de la app"
            value={bloqueoAuto}
            onChange={handleBloqueoAutoChange}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Datos</Text>
          <Text style={styles.helperText}>Total de transacciones: {totalTransacciones}</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={seedCountText}
            onChangeText={setSeedCountText}
            placeholder="Cantidad de seed (100-500)"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          />
          <Pressable style={styles.primaryButton} onPress={handleGenerateSeed}>
            <Text style={styles.primaryButtonText}>Generar datos de prueba</Text>
          </Pressable>
          <Text style={styles.seedResult}>{seedResult || 'Sin ejecuciones de seed aun.'}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Gestion de cuentas</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de cuenta"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={cuentaNombre}
            onChangeText={setCuentaNombre}
          />
          <SelectorPills<TipoCuenta>
            value={cuentaTipo}
            options={['efectivo', 'banco', 'tarjeta']}
            onSelect={setCuentaTipo}
          />
          <Pressable style={styles.primaryButton} onPress={handleCreateCuenta}>
            <Text style={styles.primaryButtonText}>Guardar cuenta</Text>
          </Pressable>

          {cuentas.map((cuenta) => (
            <View key={cuenta.cuenta_id} style={styles.settingsListItem}>
              <View>
                <Text style={styles.txTitle}>{cuenta.cuenta}</Text>
                <Text style={styles.txMeta}>Balance: {formatMoney(cuenta.balance, moneda)}</Text>
              </View>
              <Pressable style={styles.inlineDanger} onPress={() => handleDeleteCuenta(cuenta.cuenta_id)}>
                <Text style={styles.inlineDangerText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Gestion de categorias</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de categoria"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={categoriaNombre}
            onChangeText={setCategoriaNombre}
          />
          <SelectorPills<TipoMovimiento>
            value={categoriaTipo}
            options={['gasto', 'ingreso']}
            onSelect={setCategoriaTipo}
          />
          <Pressable style={styles.primaryButton} onPress={handleCreateCategoria}>
            <Text style={styles.primaryButtonText}>Guardar categoria</Text>
          </Pressable>

          {categorias.map((categoria) => (
            <View key={categoria.id} style={styles.settingsListItem}>
              <View>
                <Text style={styles.txTitle}>{categoria.nombre}</Text>
                <Text style={styles.txMeta}>Tipo: {categoria.tipo}</Text>
              </View>
              <Pressable style={styles.inlineDanger} onPress={() => handleDeleteCategoria(categoria.id)}>
                <Text style={styles.inlineDangerText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderAnalitica(): React.ReactNode {
    const topCategorias = [...informe].slice(0, 5);
    const maxCategoria = Math.max(...topCategorias.map((item) => item.total), 1);
    const maxSemanal = Math.max(...semanal.map((item) => item.gasto), 1);

    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <View style={styles.analyticsHeaderRow}>
          <Text style={styles.screenTitle}>Analitica detallada</Text>
          <Pressable style={styles.analyticsBackButton} onPress={() => setActiveTab('presupuestos')}>
            <Ionicons name="arrow-back" size={16} color="#34556d" />
            <Text style={styles.analyticsBackText}>Volver</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Balance neto del mes</Text>
          <Text style={styles.heroAmount}>{formatMoney(resumenMesActual.ingresos - resumenMesActual.gastos, moneda)}</Text>
          <Text style={styles.heroSubtext}>Periodo {reportMes}</Text>
          <Text style={resumenMesActual.variacion >= 0 ? styles.deltaPositive : styles.deltaNegative}>
            Variacion {resumenMesActual.variacion.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Gasto por categoria</Text>
          {topCategorias.length === 0 ? (
            <Text style={styles.emptyHint}>Sin datos para el mes seleccionado.</Text>
          ) : (
            topCategorias.map((item) => (
              <View key={`${item.categoria}-${item.mes}`} style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressName}>{item.categoria}</Text>
                  <Text style={styles.progressAmount}>{formatMoney(item.total, moneda)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(8, (item.total / maxCategoria) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Ritmo semanal de gasto</Text>
          {semanal.map((item) => (
            <View key={`analytics-${item.dia}`} style={styles.trendRow}>
              <Text style={styles.trendDay}>{item.dia}</Text>
              <View style={styles.trendBars}>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendExpense,
                      { width: `${Math.max(4, (item.gasto / maxSemanal) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.progressAmount}>{formatMoney(item.gasto, moneda)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderContent(): React.ReactNode {
    if (activeTab === 'inicio') {
      return renderDashboard();
    }

    if (activeTab === 'movimientos') {
      return renderMovimientos();
    }

    if (activeTab === 'presupuestos') {
      return renderPresupuestos();
    }

    if (activeTab === 'analitica') {
      return renderAnalitica();
    }

    return renderAjustes();
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.container}>
        {renderHeader()}

        {isStatusError ? (
          <View style={styles.errorBox}><Text style={styles.errorBoxText}>{statusMessage}</Text></View>
        ) : null}

        {!isReady ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Preparando base de datos...</Text>
          </View>
        ) : (
          <View style={styles.contentWrapper}>{renderContent()}</View>
        )}

        <Modal
          visible={isNotificacionesOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsNotificacionesOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Notificaciones</Text>
                <Pressable onPress={() => setIsNotificacionesOpen(false)} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={18} color="#35526a" />
                </Pressable>
              </View>

              {notificacionesItems.map((item) => (
                <View key={item.id} style={styles.modalItem}>
                  <View style={styles.modalItemIcon}>
                    <Ionicons name={item.icon} size={15} color="#1d5b83" />
                  </View>
                  <View style={styles.modalItemTextWrap}>
                    <Text style={styles.modalItemTitle}>{item.title}</Text>
                    <Text style={styles.modalItemDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))}

              <Pressable style={styles.secondaryButton} onPress={() => { void handleSendTestNotification(); }}>
                <Text style={styles.secondaryButtonText}>Enviar notificacion de prueba</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={isAppLocked} transparent animationType="fade" onRequestClose={() => {}}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Aplicacion bloqueada</Text>
              <Text style={styles.modalItemDetail}>Desbloquea para volver a usar la app.</Text>

              {faceId ? (
                <Pressable style={styles.primaryButton} onPress={() => { void handleUnlockWithBiometric(); }}>
                  <Text style={styles.primaryButtonText}>Desbloquear con Face ID</Text>
                </Pressable>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="PIN local"
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                secureTextEntry
                keyboardType="number-pad"
                value={unlockPin}
                onChangeText={setUnlockPin}
              />

              <Pressable style={styles.secondaryButton} onPress={handleUnlockWithPin}>
                <Text style={styles.secondaryButtonText}>Desbloquear con PIN</Text>
              </Pressable>

              <Text style={styles.helperText}>PIN demo: 2580</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomTabs}>
          {APP_TABS.map((tab) => {
            const selected = tab.id === activeTab;
            const iconName = selected
              ? tab.icon.replace('-outline', '')
              : tab.icon;
            return (
              <Pressable
                key={tab.id}
                style={styles.bottomTabButton}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={[styles.bottomTabIcon, selected ? styles.bottomTabIconActive : null]}>
                  <Ionicons
                    name={iconName as React.ComponentProps<typeof Ionicons>['name']}
                    size={16}
                    color={selected ? '#ffffff' : '#4a6276'}
                  />
                </View>
                <Text style={selected ? styles.bottomTabLabelActive : styles.bottomTabLabel}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

type SelectorPillsProps<T extends string | number> = {
  value: T | null;
  options: T[];
  onSelect: (value: T) => void;
  labelFor?: (value: T) => string;
};

function SelectorPills<T extends string | number>({
  value,
  options,
  onSelect,
  labelFor,
}: SelectorPillsProps<T>) {
  return (
    <View style={styles.pillRow}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={String(option)}
            style={[styles.pill, selected ? styles.pillActive : null]}
            onPress={() => onSelect(option)}
          >
            <Text style={selected ? styles.pillTextActive : styles.pillText}>
              {labelFor ? labelFor(option) : String(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function ToggleRow(props: {
  title: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextBox}>
        <Text style={styles.toggleTitle}>{props.title}</Text>
        <Text style={styles.toggleDescription}>{props.description}</Text>
      </View>
      <Switch value={props.value} onValueChange={props.onChange} trackColor={{ true: '#2e7d32' }} />
    </View>
  );
}

function budgetStatus(ratio: number): string {
  if (ratio > 1) {
    return 'Excedido';
  }
  if (ratio > 0.85) {
    return 'Cerca del limite';
  }
  return 'Saludable';
}

function getInsightFromBudget(ratio: number): string {
  if (ratio > 1) {
    return 'El gasto mensual supero el 100%. Prioriza recortar ocio y transporte esta semana.';
  }
  if (ratio > 0.85) {
    return 'Estas cerca del limite. Ajusta pequenos gastos para terminar el mes en positivo.';
  }
  return 'Buen ritmo: mantienes el presupuesto bajo control y con margen de ahorro.';
}

function toRelativeDate(isoDate: string): string {
  const today = formatDateISO(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateISO(yesterdayDate);

  if (isoDate === today) {
    return 'Hoy';
  }
  if (isoDate === yesterday) {
    return 'Ayer';
  }
  return isoDate;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMoney(amount: number, moneda: string): string {
  return `${amount.toFixed(2)} ${moneda}`;
}

function getCategoryIcon(
  categoriaNombre: string,
  tipo: TipoMovimiento
): React.ComponentProps<typeof Ionicons>['name'] {
  const categoria = categoriaNombre.toLowerCase();

  if (categoria.includes('aliment') || categoria.includes('comida')) {
    return 'restaurant-outline';
  }

  if (categoria.includes('transporte') || categoria.includes('viaje')) {
    return 'car-outline';
  }

  if (categoria.includes('hogar') || categoria.includes('vivienda')) {
    return 'home-outline';
  }

  if (categoria.includes('ocio')) {
    return 'game-controller-outline';
  }

  if (categoria.includes('salud')) {
    return 'medkit-outline';
  }

  if (categoria.includes('nomina') || categoria.includes('ingreso')) {
    return 'cash-outline';
  }

  return tipo === 'gasto' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf8fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f4f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#4c5a68',
    marginBottom: 10,
    marginTop: 2,
  },
  errorBox: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBoxText: {
    color: '#912121',
    fontWeight: '600',
  },
  contentWrapper: {
    flex: 1,
  },
  loadingBox: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  loadingText: {
    color: '#536171',
  },
  screenContent: {
    paddingBottom: 110,
    gap: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d2d3b',
    marginBottom: 2,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: '#eef4f8',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  analyticsBackText: {
    color: '#34556d',
    fontWeight: '700',
    fontSize: 12,
  },
  heroCard: {
    backgroundColor: '#004f76',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0e3750',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroLabel: {
    color: '#d3e9f6',
    fontSize: 13,
    marginBottom: 4,
  },
  heroAmount: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSubtext: {
    color: '#d4e8f4',
    fontSize: 13,
  },
  deltaPositive: {
    marginTop: 8,
    color: '#8ff2a2',
    fontWeight: '700',
  },
  deltaNegative: {
    marginTop: 8,
    color: '#ffd5d5',
    fontWeight: '700',
  },
  heroStatsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  heroChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroChipText: {
    color: '#f4fbff',
    fontSize: 11,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#005a87',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#1b6d24',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#203645',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2f3d',
    marginBottom: 8,
  },
  progressItem: {
    marginBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressName: {
    color: '#1f2f3d',
    fontWeight: '600',
  },
  progressAmount: {
    color: '#4b5d6c',
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#e9eff4',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#005a87',
  },
  progressFillWarn: {
    backgroundColor: '#b07d07',
  },
  progressFillDanger: {
    backgroundColor: '#a52e2e',
  },
  progressCaption: {
    marginTop: 4,
    color: '#5a6977',
    fontSize: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendDay: {
    width: 36,
    color: '#4b5d6c',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  trendBars: {
    flex: 1,
    gap: 4,
  },
  trendTrack: {
    height: 6,
    borderRadius: 10,
    backgroundColor: '#edf3f7',
    overflow: 'hidden',
  },
  trendIncome: {
    height: 6,
    backgroundColor: '#1b6d24',
  },
  trendExpense: {
    height: 6,
    backgroundColor: '#b33a3a',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  txIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e7edf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#30506a',
  },
  txMain: {
    flex: 1,
  },
  txTitle: {
    color: '#1f2f3d',
    fontWeight: '600',
  },
  txMeta: {
    color: '#637586',
    fontSize: 12,
  },
  txExpense: {
    color: '#b23d3d',
    fontWeight: '700',
  },
  txIncome: {
    color: '#1f7f2a',
    fontWeight: '700',
  },
  searchBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e4ebf1',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#203645',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    height: 44,
    color: '#1f2f3d',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7e1e8',
    borderRadius: 12,
    backgroundColor: '#fbfdff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#5b6a79',
    marginBottom: 5,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cdd8e2',
    backgroundColor: '#f2f6fa',
  },
  pillActive: {
    borderColor: '#005a87',
    backgroundColor: '#005a87',
  },
  pillText: {
    color: '#33495c',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#005a87',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8d5e2',
    backgroundColor: '#f5f9fc',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: '#39566e',
    fontWeight: '700',
  },
  helperText: {
    color: '#617283',
    marginBottom: 8,
  },
  emptyHint: {
    color: '#6f7f90',
    marginTop: 4,
  },
  groupBlock: {
    marginBottom: 10,
  },
  groupTitle: {
    fontWeight: '700',
    color: '#32485c',
    marginBottom: 6,
  },
  txCard: {
    backgroundColor: '#f8fbfd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 7,
  },
  swipeActionButton: {
    width: 90,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  swipeEditButton: {
    backgroundColor: '#1f7f9d',
  },
  swipeDeleteButton: {
    backgroundColor: '#a83434',
  },
  swipeActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  txCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9f0f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txCardMain: {
    flex: 1,
  },
  insightCard: {
    backgroundColor: '#edf5fb',
    borderRadius: 16,
    padding: 14,
  },
  insightTitle: {
    color: '#114d72',
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 6,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  insightText: {
    color: '#2f5168',
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf3f7',
  },
  toggleTextBox: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    color: '#1f2f3d',
    fontWeight: '600',
  },
  toggleDescription: {
    color: '#657789',
    fontSize: 12,
  },
  seedResult: {
    color: '#415668',
    fontWeight: '600',
  },
  settingsListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#f8fbfd',
    marginBottom: 8,
  },
  inlineDanger: {
    borderRadius: 10,
    backgroundColor: '#ffecec',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineDangerText: {
    color: '#a83131',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomTabs: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#dce6ee',
    shadowColor: '#183143',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomTabIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf2f6',
  },
  bottomTabIconActive: {
    backgroundColor: '#005a87',
  },
  bottomTabLabel: {
    color: '#55697b',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomTabLabelActive: {
    color: '#005a87',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 28, 38, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#132a3b',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#1f2f3d',
    fontWeight: '700',
    fontSize: 18,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eef4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#f8fbfd',
    borderRadius: 12,
    padding: 10,
  },
  modalItemIcon: {
    width: 24,
    marginRight: 8,
    marginTop: 1,
    alignItems: 'center',
  },
  modalItemTextWrap: {
    flex: 1,
  },
  modalItemTitle: {
    color: '#1f2f3d',
    fontWeight: '700',
    marginBottom: 2,
  },
  modalItemDetail: {
    color: '#576b7d',
    fontSize: 12,
    lineHeight: 18,
  },
});
