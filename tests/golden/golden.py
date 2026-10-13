# Independent re-derivation of the worked examples (Decimal arithmetic, no shared code with the TS engine).
from decimal import Decimal as D, ROUND_HALF_UP
from datetime import date, timedelta
import calendar, json

def r2(x): return D(x).quantize(D('0.01'), rounding=ROUND_HALF_UP)

T2026 = [(D('0.01'),D('0'),D('1.92')),(D('844.60'),D('16.22'),D('6.40')),(D('7168.52'),D('420.95'),D('10.88')),(D('12598.03'),D('1011.68'),D('16.00')),(D('14644.65'),D('1339.14'),D('17.92')),(D('17533.65'),D('1856.84'),D('21.36')),(D('35362.84'),D('5665.16'),D('23.52')),(D('55736.69'),D('10457.09'),D('30.00')),(D('106410.51'),D('25659.23'),D('32.00')),(D('141880.67'),D('37009.69'),D('34.00')),(D('425642.00'),D('133488.54'),D('35.00'))]
UMA26 = D('117.31'); SM_G=D('315.04'); SM_Z=D('440.87')

def isr(x, t=T2026):
    if x <= 0: return D(0)
    row=None
    for lo,f,p in t:
        if lo <= x: row=(lo,f,p)
    lo,f,p=row
    return f + (x-lo)*p/D(100)

def marg(base, extra): return isr(base+extra)-isr(base) if extra>0 else D(0)

def art174(base, taxable):
    if taxable<=0: return D(0)
    m = taxable/D(365)*D('30.4')
    rate = marg(base,m)/m
    return rate*taxable

def addyears(d,n):
    y=d.year+n
    try: return d.replace(year=y)
    except ValueError: return d.replace(year=y, day=28)

def seniority(start,end):
    endx=end+timedelta(days=1); n=0
    while addyears(start,n+1)<=endx: n+=1
    last=addyears(start,n); nxt=addyears(start,n+1)
    into=(endx-last).days; length=(nxt-last).days
    return n,last,into,length, D(n)+D(into)/D(length)

def vac(n):
    if n<1: return 0
    if n<=5: return 12+2*(n-1)
    return 20+2*-(-(n-5)//5)

out={}
# ---------- Aguinaldo
def aguinaldo(daily, days_ag, start, end, year, method, monthly=None):
    jan1=date(year,1,1); dec31=date(year,12,31)
    f=max(start or jan1, jan1); t=min(end or dec31, dec31)
    worked=(t-f).days+1
    prop=D(days_ag)*D(min(worked,365))/D(365)
    gross=r2(daily*prop)
    cap=r2(30*UMA26); ex=min(gross,cap); tax=r2(gross-ex)
    m = monthly if monthly is not None else daily*D('30.4')
    i96=r2(marg(m,tax)); i174=r2(art174(m,tax))
    isr_=i174 if method=='art174' else i96
    return dict(worked=worked, prop=str(prop), gross=str(gross), exempt=str(ex), taxable=str(tax), isr96=str(i96), isr174=str(i174), net=str(r2(gross-isr_)))
out['AG1']=aguinaldo(D(500),15,None,None,2026,'art96')
out['AG2']=aguinaldo(D('333.33'),15,date(2026,6,1),None,2026,'art96')
out['AG3']=aguinaldo(D(25000)/D(30),30,None,None,2026,'art174',monthly=D(25000))
out['AG_CCL_days']=str(D(15)*D(233)/D(365))
# ---------- Prima vacacional
def pv(daily,days,pct,method):
    gross=r2(daily*D(days)*D(pct)/D(100)); cap=r2(15*UMA26); ex=min(gross,cap); tax=r2(gross-ex)
    m=daily*D('30.4'); i96=r2(marg(m,tax)); i174=r2(art174(m,tax))
    return dict(gross=str(gross),exempt=str(ex),taxable=str(tax),isr96=str(i96),isr174=str(i174),net96=str(r2(gross-i96)),net174=str(r2(gross-i174)))
out['PV1']=pv(D(500),12,25,'art96')
out['PV2']=pv(D(800),22,30,'art96')
out['PV3']=pv(D('440.87'),14,25,'art96')
# ---------- Vacaciones
def vacs(daily,start,ref,pct):
    n,last,into,length,ex=seniority(start,ref)
    earned=vac(n); nxt=vac(n+1); acc=D(nxt)*D(into)/D(length)
    return dict(completed=n, earned=earned, next=nxt, accrued=str(acc), pay=str(r2(daily*earned)), prima=str(r2(daily*earned*D(pct)/100)))
out['V1']=vacs(D(500),date(2025,6,1),date(2026,6,15),25)
out['V2']=vacs(D(600),date(2019,3,4),date(2026,10,13),25)
out['V3']=vacs(D(1000),date(2000,1,10),date(2026,10,13),25)
# ---------- Separation
def sep(salary, period, start, end, cause, inc20, ag_days, pct, pending, unpaid, zone, sdi=None):
    daily = salary if period=='diario' else salary/D(30)
    monthly = salary if period=='mensual' else daily*D('30.4')
    n,last,into,length,exy=seniority(start,end)
    cur=vac(n+1); p=D(pct)/100
    factor=1+(D(ag_days)+D(cur)*p)/D(365)
    sdi_used = sdi if sdi is not None else r2(daily*factor)
    items=[]
    if unpaid>0:
        g=r2(daily*D(unpaid)); items.append(['salario_pendiente',g,D(0),g,'ord'])
    jan1=date(end.year,1,1); dty=(end-max(start,jan1)).days+1
    agd=D(ag_days)*D(min(dty,365))/D(365); g=r2(daily*agd); e=min(g,r2(30*UMA26)); items.append(['aguinaldo',g,e,r2(g-e),'ord'])
    vd=D(cur)*D(into)/D(length)+D(pending)
    if vd>0:
        g=r2(daily*vd); items.append(['vacaciones',g,D(0),g,'ord'])
        g2=r2(daily*vd*p); e2=min(g2,r2(15*UMA26)); items.append(['prima_vacacional',g2,e2,r2(g2-e2),'ord'])
    sepi=[]
    constitutional = cause in ('despido_injustificado','rescision_trabajador')
    twenty = cause=='rescision_trabajador' or (cause=='despido_injustificado' and inc20)
    voluntary = cause in ('renuncia','mutuo_acuerdo')
    prima = (n>=15) if voluntary else True
    if constitutional: sepi.append(['indemnizacion_constitucional', r2(sdi_used*90)])
    if twenty: sepi.append(['indemnizacion_20_dias', r2(sdi_used*D(20)*exy)])
    sm = SM_Z if zone=='zlfn' else SM_G
    cap=r2(sm*2); base=r2(min(max(sdi_used,sm),cap))
    if prima: sepi.append(['prima_antiguedad', r2(base*D(12)*exy)])
    # exemption years: + 1 if more than 6 months into the current year
    def addm(d,k):
        mi=d.month-1+k; y=d.year+mi//12; mo=mi%12+1; dd=min(d.day,calendar.monthrange(y,mo)[1]); return date(y,mo,dd)
    yrs = n + (1 if into>0 and addm(last,6) < end+timedelta(days=1) else 0)
    sep_cap=r2(90*UMA26*yrs)
    sg=sum((x[1] for x in sepi), D(0)); sep_ex=min(sg,sep_cap); sep_tax=r2(sg-sep_ex)
    # ISR
    rate=isr(monthly)/monthly
    pend=[x for x in items if x[0]=='salario_pendiente']
    extras=sum((x[3] for x in items if x[0]!='salario_pendiente'), D(0))
    i_ord=r2((pend[0][3]*rate if pend else 0) + marg(monthly, extras))
    if sep_tax<=0: i_sep=D(0); meth='none'
    elif sep_tax>=monthly: i_sep=r2(sep_tax*rate); meth='effective-rate'
    else: i_sep=r2(marg(monthly+extras, sep_tax)); meth='added-to-income'
    gross=sum((x[1] for x in items),D(0))+sg
    return dict(completed=n, exactYears=str(exy), sdi=str(sdi_used), factor=str(factor), items={x[0]:dict(gross=str(x[1]),exempt=str(x[2])) for x in items}, sep={x[0]:str(x[1]) for x in sepi},
                finiquito=str(sum((x[1] for x in items),D(0))), sepGross=str(sg), sepExemptCap=str(sep_cap), yearsExempt=yrs, seniorityBase=str(base), cap=str(cap),
                isrOrd=str(i_ord), isrSep=str(i_sep), isrMethod=meth, gross=str(gross), net=str(r2(gross-i_ord-i_sep)))
out['F1']=sep(D(15000),'mensual',date(2023,3,1),date(2026,10,15),'renuncia',False,15,25,0,0,'general')
out['F2']=sep(D(900),'diario',date(2010,6,1),date(2026,9,30),'renuncia',False,15,25,0,15,'general')
out['F3']=sep(D(400),'diario',date(2026,2,16),date(2026,8,31),'renuncia',False,15,25,0,0,'general')
out['L1']=sep(D('333.33'),'diario',date(2021,10,16),date(2026,10,15),'despido_injustificado',True,15,25,0,0,'general',sdi=D('349.31'))
out['L2']=sep(D(45000),'mensual',date(2018,1,8),date(2026,10,31),'despido_injustificado',False,30,50,6,0,'general')
out['L3']=sep(D(600),'diario',date(2022,5,2),date(2026,10,9),'rescision_trabajador',False,15,25,0,0,'zlfn')
print(json.dumps(out,indent=1))
