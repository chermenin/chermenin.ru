---
layout: post
title: Spark UDAF
description: Пишем собственную агрегирующую функцию.
tags:
    - spark
    - bigdata
    - кодинг
---
Apache Spark начиная с версии 1.3 предоставляет богатый API, основанный на
_DataFrame_-ах. Доступно множество функций для построения запросов, а также для
выполнения различных преобразований. В общем, всё для того, чтобы получить
именно тот результат, который хотелось бы. Помимо этого есть возможность
создавать собственные функции - имплементации интерфейсов _UDF1..22_. Такие
функции создаются довольно просто и сегодня разговор будет не о них.

Среди прочих у объекта класса _DataFrame_ имеется метод _groupBy_, с помощью
которого в сочетании с методом _agg_ можно добиться группировки данных с
вычислением какой-либо агрегирующей функции. Таких функций сравнительно
немного - _count_, _min_, _max_, _sum_, _avg_.

Однако, точно так же, как и с UDF, имеется возможность описать собственную
агрегирующую функцию. Этим мы сегодня и займёмся. Задача у нас будет следующая:
в структуре, в которой имеется два столбца (строковый идентификатор _id_ и
некоторая структура _struct_) необходимо сгруппировать структуры по
идентификаторам, сложив структуры в массивы.

Для реализации собственной агрегирующей функции необходимо унаследоваться от
класса _UserDefinedAggregateFunction_ и переопределить следующие методы:

- _inputSchema_ - описание структуры данных, которая будет на входе
- _bufferSchema_ - описание структуры данных, которая используется в процессе
работы
- _dataType_ - описание структуры данных, возвращаемых в качестве результата
функции
- _deterministic_ - возвращает ли функция один и тот же результат при подаче на
вход одних и тех же данных
- _initialize_ - инициализация функции
- _update_ - обработка одной строки из набора данных
- _merge_ - объединение результатов параллельных вычислений
- _evaluate_ - возвращение результата выполнения функции

Так как конкретное описание структуры в наборе данных у нас не указано, можно
использовать поле, значение которого будет задаваться в конструкторе.

Таким образом, полная реализация пользовательской функции будет выглядеть
следующим образом:

    import ...;

    public class ArrayUDAF extends UserDefinedAggregateFunction {

        private StructType inputSchema;

        private String name;

        public ArrayUDAF(String name, StructType inputSchema) {
            this.name = name;
            this.inputSchema = inputSchema;
        }

        public String getName() {
            return name;
        }

        @Override
        public StructType inputSchema() {
            return new StructType().add("struct", inputSchema);
        }

        @Override
        public StructType bufferSchema() {
            return new StructType().add("array", new ArrayType(inputSchema, true));
        }

        @Override
        public DataType dataType() {
            return new ArrayType(inputSchema, true);
        }

        @Override
        public boolean deterministic() {
            return true;
        }

        @Override
        public void initialize(MutableAggregationBuffer buffer) {
             buffer.update(0, new Object[0]);
        }

        @Override
        public void update(MutableAggregationBuffer buffer, Row input) {
            Object[] data = (Object[]) ((WrappedArray) buffer.get(0)).array();
            Object[] objects = new Object[data.length + 1];
            System.arraycopy(data, 0, objects, 0, data.length);
            objects[objects.length - 1] = input.get(0);
            buffer.update(0, objects);
        }

        @Override
        public void merge(MutableAggregationBuffer buffer1, Row buffer2) {
            Object[] data1 = (Object[]) ((WrappedArray) buffer1.get(0)).array();
            Object[] data2 = (Object[]) ((WrappedArray) buffer2.get(0)).array();
            int num1 = data1.length;
            int num2 = data2.length;
            Object[] objects = new Object[num1 + num2];
            System.arraycopy(data1, 0, objects, 0, num1);
            System.arraycopy(data2, 0, objects, num1, num2);
            buffer1.update(0, objects);
        }

        @Override
        public WrappedArray evaluate(Row buffer) {
            return (WrappedArray) buffer.get(0);
        }
    }

А теперь подробнее о каждом методе:

    public StructType inputSchema() {
        return new StructType().add("struct", inputSchema);
    }

Указывает, что в качестве единственного входного параметра нашей функции
используется столбец со структурой, описанной в поле _inputSchema_. В качестве
имени (в данном случае _struct_) можно указать любое другое, здесь учитываются
лишь типы.

    public StructType bufferSchema() {
        return new StructType().add("array", new ArrayType(inputSchema, true));
    }

В качестве хранилища промежуточных значений у нас используется буфер с одним
полем, которое является массивом со элементами той же структуры, что и входной
столбец.

    public DataType dataType() {
        return new ArrayType(inputSchema, true);
    }

И возвращаться тоже будет массив с теми же элементами.

    public boolean deterministic() {
        return true;
    }

Тут всё понятно...

    public void initialize(MutableAggregationBuffer buffer) {
         buffer.update(0, new Object[0]);
    }

При инициализации функции создаётся пустой массив, в который потом будут
добавляться сгруппированные элементы.

    public void update(MutableAggregationBuffer buffer, Row input) {
        Object[] data = (Object[]) ((WrappedArray) buffer.get(0)).array();
        Object[] objects = new Object[data.length + 1];
        System.arraycopy(data, 0, objects, 0, data.length);
        objects[objects.length - 1] = input.get(0);
        buffer.update(0, objects);
    }

Элемент из каждой строки добавляется в буфер: создается новый массив, куда
копируются предыдущие элементы и добавляется элемент из текущей строки.

    public void merge(MutableAggregationBuffer buffer1, Row buffer2) {
        Object[] data1 = (Object[]) ((WrappedArray) buffer1.get(0)).array();
        Object[] data2 = (Object[]) ((WrappedArray) buffer2.get(0)).array();
        int num1 = data1.length;
        int num2 = data2.length;
        Object[] objects = new Object[num1 + num2];
        System.arraycopy(data1, 0, objects, 0, num1);
        System.arraycopy(data2, 0, objects, num1, num2);
        buffer1.update(0, objects);
    }

Два массива элементов объединяются в один.

    public WrappedArray evaluate(Row buffer) {
        return (WrappedArray) buffer.get(0);
    }

И возвращается готовый массив со всеми собранными элементами.

Использовать написанную функцию можно следующим образом:

    ArrayUDAF arrayUDAF = new ArrayUDAF("AggToArray", new StructType(new StructField[]{
            new StructField("first_name", DataTypes.StringType, true, Metadata.empty()),
            new StructField("last_name", DataTypes.StringType, true, Metadata.empty())
    }));
    sqlContext.udf().register(arrayUDAF.getName(), arrayUDAF);
    DataFrame aggDf = df.select(
            column("id"),
            struct(
                    column("friend.first_name").as("first_name"),
                    column("friend.last_name").as("last_name")
            ).as("friend")
    ).groupBy("id").agg(callUDF(arrayUDAF.getName(), column("friend")).as("friends"));

И все друзья будут не отдельными записями, а все вместе в массивах по
идентификаторам.

Впрочем, если писать с использованием Spark 1.6.0 или новее, то в данном случае
можно (и даже нужно) пользоваться агрегирующей функцией _collect_list_. Вот так.

Удачи в коде! ;)
