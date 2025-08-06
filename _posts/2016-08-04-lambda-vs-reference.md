---
layout: post
title: x -> x.toString() vs Object::toString
description: История о лямбдах и ссылках на методы.
metadata: Описание разницы между лямбдами и ссылками на методы в Java
keywords:
    - java
    - scala
    - лямбда
    - ссылка
    - метод
    - lambda
    - reference
    - method
    - object
    - string
tags:
    - java
    - кодинг
    - flink
    - bigdata
---
Лямбды пришли в мир Java вместе с 8-ой версией, которая впервые вышла в 2014
году. Тогда же возник термин "квадроточие", описывающий оператор `::` -
ссылку на метод.

Довольно быстро среды разработки подстроились под новый мир и стали предлагать
по возможности сворачивать код до лямбд или ссылок на методы. Однако не все
задумываются, можно и нужно ли сворачивать лямбду до ссылки на метод и что за
этим может стоять.

В декабре 2015 года в таск-трекере такого проекта как Flink появилась запись
<a href="https://issues.apache.org/jira/browse/FLINK-3138" target="_blank">
[FLINK-3138] Method References are not supported as lambda expressions</a>.
В описании приводилось, что следующий код работает нормально:

    DataStream<MyType> stream = ...;
    stream.keyBy(v -> v.getId())

а вот такой - уже не работает:

    DataStream<MyType> stream = ...;
    stream.keyBy(MyType::getId)

Хотя, например, IntelliJ IDEA упорно бы подсвечивала первый вариант, предлагая
свернуть его до второго. Разберёмся, в чём же проблема и чем эти варианты кода
отличаются друг от друга.

Для этого напишем другой небольшой кусок кода, который нам всё расскажет:

    import ...

    public class Test {

        public static void main(String[] args) throws Exception {
            System.out.println("\nLambda:");
            explore((Serializable & Function<Integer, String>) x -> x.toString());
            System.out.println("\nMethod reference:");
            explore((Serializable & Function<Integer, String>) Object::toString);
        }

        private static void explore(Object o) throws InvocationTargetException, IllegalAccessException {
            SerializedLambda serializedLambda = null;

            for (Class<?> clazz = o.getClass(); clazz != null; clazz = clazz.getSuperclass()) {
                try {
                    Method replaceMethod = clazz.getDeclaredMethod("writeReplace");
                    replaceMethod.setAccessible(true);
                    Object serialVersion = replaceMethod.invoke(o);
                    serializedLambda = (SerializedLambda) serialVersion;
                    break;
                }
                catch (NoSuchMethodException e) {
                    // thrown if the method is not there. fall through the loop
                }
            }

            if (serializedLambda != null) {
                String implClass = serializedLambda.getImplClass();
                String implMethodName = serializedLambda.getImplMethodName();
                String implMethodSignature = serializedLambda.getImplMethodSignature();
                int implMethodKind = serializedLambda.getImplMethodKind();
                String referenceKind = MethodHandleInfo.referenceKindToString(implMethodKind);
                System.out.println("implClass = " + implClass);
                System.out.println("implMethodName = " + implMethodName);
                System.out.println("implMethodSignature = " + implMethodSignature);
                System.out.println("implMethodKind = " + referenceKind);
            }
        }
    }

В коде просто происходит сериализация лямбд и последующий вывод некоторой
информации о полученных объектах. На самом деле именно такие действия происходят
в коде Flink-а.

Посмотрим на получившийся вывод:

    Lambda:
        implClass = Test
        implMethodName = lambda$main$30574422$1
        implMethodSignature = (Ljava/lang/Integer;)Ljava/lang/String;
        implMethodKind = invokeStatic

    Method reference:
        implClass = java/lang/Object
        implMethodName = toString
        implMethodSignature = ()Ljava/lang/String;
        implMethodKind = invokeVirtual

Итак, _x -> x.toString()_ и _Object::toString_ совершенно не похожи друг на
друга, что, впрочем, полностью логично. В первом случае мы имеем полноценный
статический метод класса _Test_ с одним параметром типа _Integer_, возвращающий
нам _String_. Во втором же случае - метод относится к классу _java.lang.Object_
(что правильно, именно на него указана ссылка), не принимает параметров и
возвращает _String_. В соответствии с этим различаются даже способы вызова
методов.

Именно проверки этих различий и не было в коде Flink-а - проверялись типы
входных параметров сериализованной лямбды, однако во втором случае параметров
просто нет и генерировалось исключение.

Подводя итог всему вышесказанному - во-первых, стоит понимать, как ведут себя
лямбды и ссылки на методы и пользоваться ими правильно, во-вторых, при
использовании Flink версии 1.0.3 или ниже не стоит использовать ссылки на
динамические методы (ссылки на статические методы классов работают нормально).
В последующих версиях данная ошибка будет исправлена.

Пользуйтесь последними версиями библиотек и удачи в коде! ;)
